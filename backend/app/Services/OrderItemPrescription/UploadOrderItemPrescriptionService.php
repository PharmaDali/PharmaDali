<?php

namespace App\Services\OrderItemPrescription;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemPrescription;
use App\Models\User;
use App\Enums\OrderStatus;
use App\Notifications\OrderStatusNotification;
use App\Notifications\PrescriptionReuploadedNotification;
use App\Services\Messaging\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UploadOrderItemPrescriptionService
{
    public function handle(?User $user, int $orderItemId, UploadedFile $image): JsonResponse
    {
        if (! $user || $user->role !== 'customer') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only customers can upload prescription images.',
            ], 403);
        }

        $customerId = $user->customer?->id;

        if (! $customerId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer profile not found.',
            ], 403);
        }

        $orderItem = OrderItem::query()
            ->where('id', $orderItemId)
            ->whereHas('order', function ($query) use ($customerId) {
                $query->where('customer_id', $customerId);
            })
            ->with('order')
            ->first();

        if (! $orderItem) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order item not found or does not belong to this customer.',
            ], 404);
        }

        $storedPath = $image->store('prescriptions/order-items', 'public');

        $record = DB::transaction(function () use ($orderItemId, $storedPath, $orderItem) {
            $prescription = OrderItemPrescription::query()->updateOrCreate(
                ['order_item_id' => $orderItemId],
                [
                    'prescription_image_path' => $storedPath,
                    'status' => 'pending',
                    'verified_by' => null,
                    'verified_at' => null,
                    'rejection_reason' => null,
                ],
            );

            $order = $orderItem->order;
            if ($order && in_array($order->status, [OrderStatus::STAND_BY, OrderStatus::PENDING])) {
                $order->update([
                    'status' => OrderStatus::REVIEWING,
                    'cancellation_reason' => null,
                ]);
            }

            return $prescription;
        });

        $order = $orderItem->order?->fresh();
        if ($order) {
            try {
                app(ConversationService::class)->appendSystemMessage(
                    $order,
                    'Customer uploaded a new prescription. Order is out pending and ready for review.',
                    [
                        'action' => 'out_pending',
                        'status' => $order->status,
                    ]
                );
            } catch (\Throwable $e) {
                Log::warning('Failed to append prescription re-upload chat message: ' . $e->getMessage());
            }

            try {
                $order->customer?->user?->notify(new OrderStatusNotification($order));
            } catch (\Throwable $notifEx) {
                Log::warning('Failed to notify customer on prescription re-upload status update: ' . $notifEx->getMessage());
            }

            $this->notifyPharmacists($order);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Prescription image uploaded successfully.',
            'data' => [
                'order_item_id' => $record->order_item_id,
                'prescription_image_path' => $record->prescription_image_path,
                'status' => $record->status,
            ],
        ]);
    }

    private function notifyPharmacists(Order $order): void
    {
        $pharmacyId = $order->pharmacy_id;
        if (!$pharmacyId) return;

        $pharmacists = User::where(function ($q) use ($pharmacyId) {
            $q->where('pharmacy_id', $pharmacyId)
              ->orWhereNull('pharmacy_id');
        })
        ->whereIn('role', ['pharmacy_admin', 'pharmacist'])
        ->get();

        foreach ($pharmacists as $pharmacist) {
            try {
                $pharmacist->notify(new PrescriptionReuploadedNotification($order));
            } catch (\Throwable $e) {
                Log::warning('Failed to notify pharmacist of prescription re-upload: ' . $e->getMessage());
            }
        }
    }
}
