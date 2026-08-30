<?php

namespace App\Services\Order;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use App\Notifications\OrderRejectedNotification;
use App\Notifications\OrderStatusNotification;
use App\Notifications\DiscountIdVerifiedNotification;
use App\Notifications\PaymentReceiptVerifiedNotification;
use App\Services\Messaging\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class UpdateOrderStatusByPharmacistService
{
    private const ACTION_TO_STATUS = [
        'approve'     => OrderStatus::PREPARING,
        'ready'       => OrderStatus::READY_FOR_PICKUP,
        'pending'     => OrderStatus::STAND_BY,
        'out_pending' => OrderStatus::REVIEWING,
        'reject'      => OrderStatus::CANCELLED,
    ];

    private const ACTION_ALLOWED_CURRENT_STATUSES = [
        'approve'     => [OrderStatus::PENDING, OrderStatus::REVIEWING],
        'ready'       => [OrderStatus::PREPARING],
        'pending'     => [OrderStatus::PENDING, OrderStatus::REVIEWING, OrderStatus::PREPARING, OrderStatus::READY_FOR_PICKUP],
        'out_pending' => [OrderStatus::STAND_BY, OrderStatus::PENDING],
        'reject'      => [OrderStatus::PENDING, OrderStatus::REVIEWING, OrderStatus::PREPARING, OrderStatus::READY_FOR_PICKUP],
    ];

    public function __construct(
        private readonly ConversationService $conversationService
    ) {}

    public function handle(?User $user, Order $order, string $action, ?string $reason = null, ?string $section = null): JsonResponse
    {
        if (!$user || $user->role !== 'pharmacist') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Only pharmacists can update order status.',
            ], 403);
        }

        $pharmacistProfile = $user->pharmacist;
        if (!$pharmacistProfile) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Pharmacist profile not found.',
            ], 403);
        }

        if (!is_null($user->pharmacy_id) && $order->pharmacy_id !== $user->pharmacy_id) {
            return response()->json([
                'status'  => 'error',
                'message' => 'You are not allowed to update this order.',
            ], 403);
        }

        if (!array_key_exists($action, self::ACTION_TO_STATUS)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Unsupported pharmacist action.',
            ], 422);
        }

        $allowedCurrentStatuses = self::ACTION_ALLOWED_CURRENT_STATUSES[$action];
        if (!in_array($order->status, $allowedCurrentStatuses, true)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'This order cannot be updated to the requested status.',
            ], 422);
        }

        if ($action === 'reject' && blank($reason) && !$section) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Reason is required when rejecting an order.',
            ], 422);
        }

        // Handle section-specific rejections (Prescription, Discount ID, Payment Receipt)
        if ($action === 'reject' && !empty($section)) {
            return $this->handleSectionRejection($user, $order, $section, $reason);
        }

        // Handle section-specific approvals (Discount ID, Payment Receipt)
        if ($action === 'approve' && !empty($section) && in_array($section, ['discount', 'receipt'])) {
            return $this->handleSectionApproval($user, $order, $section);
        }

        $nextStatus = self::ACTION_TO_STATUS[$action];

        $updatePayload = [
            'status'      => $nextStatus,
            'verified_by' => $user->id,
            'verified_at' => now(),
        ];

        if ($nextStatus === OrderStatus::CANCELLED) {
            $updatePayload['cancelled_at'] = now();
            $updatePayload['cancellation_reason'] = 'Rejected by pharmacist: ' . trim((string) $reason);
        } elseif ($nextStatus === OrderStatus::STAND_BY && !empty($reason)) {
            $updatePayload['cancellation_reason'] = trim((string) $reason);
        }

        $order->update($updatePayload);
        $order = $order->fresh();

        // Notify customer about status change
        if ($action === 'reject') {
            $order->customer->user->notify(new OrderRejectedNotification($order));
        } else {
            $order->customer->user->notify(new OrderStatusNotification($order));
        }

        $systemMessage = match ($action) {
            'approve'     => 'Prescription approved',
            'ready'       => 'Ready for pickup',
            'pending'     => 'Order placed on hold',
            'out_pending' => 'Order removed from hold',
            default       => 'Order rejected',
        };

        $msg = $this->conversationService->appendSystemMessage($order, $systemMessage, [
            'action' => $action,
            'status' => $order->status,
            'reason' => $reason,
        ]);

        if ($action === 'reject') {
            try {
                $msg->conversation()->update([
                    'status'    => 'closed',
                    'closed_at' => now(),
                ]);
            } catch (\Throwable $e) {
                Log::error('Failed to close conversation on pharmacist reject: ' . $e->getMessage());
            }
        }

        $successMessage = match ($action) {
            'approve'     => 'Order approved successfully.',
            'ready'       => 'Order marked as ready for pickup.',
            'pending'     => 'Order marked as pending successfully.',
            'out_pending' => 'Order removed from pending status.',
            default       => 'Order rejected successfully.',
        };

        return response()->json([
            'status'  => 'success',
            'message' => $successMessage,
            'data'    => $order->fresh(),
        ]);
    }

    private function handleSectionRejection(User $user, Order $order, string $section, ?string $reason): JsonResponse
    {
        $cleanReason = trim((string) $reason);
        $order->load(['items.orderItemPrescription']);

        switch ($section) {
            case 'prescription':
                foreach ($order->items as $item) {
                    if ($item->orderItemPrescription) {
                        $item->orderItemPrescription->update([
                            'status'           => 'rejected',
                            'rejection_reason' => $cleanReason ?: 'Prescription rejected by pharmacist.',
                            'verified_by'       => $user->id,
                            'verified_at'       => now(),
                        ]);
                    }
                }
                $order->update([
                    'status'              => OrderStatus::STAND_BY,
                    'cancellation_reason' => 'Prescription rejected: ' . ($cleanReason ?: 'Invalid prescription'),
                ]);
                $systemMsg = 'Prescription rejected by pharmacist: ' . ($cleanReason ?: 'Invalid prescription');
                break;

            case 'discount':
                $order->update([
                    'discount_remarks' => 'rejected: ' . ($cleanReason ?: 'Online ID verification rejected. Present physical ID upon pickup.'),
                ]);
                $systemMsg = 'Discount ID rejected: Please present physical ID upon pickup.';
                break;

            case 'receipt':
                $order->update([
                    'payment_status' => \App\Enums\PaymentStatus::FAILED,
                    'note'           => trim(($order->note ? $order->note . ' | ' : '') . 'Payment receipt rejected: ' . ($cleanReason ?: 'Pay upon pickup.')),
                ]);
                $systemMsg = 'Payment receipt rejected: Please pay at the pharmacy upon pickup.';
                break;

            default:
                return response()->json(['status' => 'error', 'message' => 'Invalid rejection section.'], 422);
        }

        $order = $order->fresh();

        if ($section === 'discount') {
            $order->customer->user->notify(new DiscountIdVerifiedNotification($order, false));
        } elseif ($section === 'receipt') {
            $order->customer->user->notify(new PaymentReceiptVerifiedNotification($order, false));
        } else {
            $order->customer->user->notify(new OrderStatusNotification($order));
        }
        
        $this->conversationService->appendSystemMessage($order, $systemMsg);

        return response()->json([
            'status'  => 'success',
            'message' => 'Section rejection processed. Order placed on hold awaiting customer response.',
            'data'    => $order,
        ]);
    }

    private function handleSectionApproval(User $user, Order $order, string $section): JsonResponse
    {
        $order->load(['items.orderItemPrescription']);

        switch ($section) {
            case 'discount':
                $order->update([
                    'discount_remarks' => 'approved',
                ]);
                $systemMsg = 'Discount ID approved by pharmacist.';
                $order = $order->fresh();
                $order->customer->user->notify(new DiscountIdVerifiedNotification($order, true));
                break;

            case 'receipt':
                $order->update([
                    'payment_status' => \App\Enums\PaymentStatus::PAID,
                ]);
                $systemMsg = 'Online payment receipt approved by pharmacist.';
                $order = $order->fresh();
                $order->customer->user->notify(new PaymentReceiptVerifiedNotification($order, true));
                break;

            default:
                return response()->json(['status' => 'error', 'message' => 'Invalid approval section.'], 422);
        }

        $this->conversationService->appendSystemMessage($order, $systemMsg);

        return response()->json([
            'status'  => 'success',
            'message' => 'Section approval processed successfully.',
            'data'    => $order,
        ]);
    }
}