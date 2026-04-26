<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UpdateOrderStatusByPharmacistService
{
    private const ACTION_TO_STATUS = [
        'approve' => 'preparing',
        'ready' => 'ready_for_pickup',
        'complete' => 'completed',
        'pending' => 'stand_by',
        'reject' => 'cancelled',
    ];

    private const ACTION_ALLOWED_CURRENT_STATUSES = [
        'approve' => ['pending', 'reviewing'],
        'ready' => ['preparing'],
        'complete' => ['ready_for_pickup'],
        'pending' => ['pending', 'reviewing', 'preparing', 'ready_for_pickup'],
        'reject' => ['pending', 'reviewing', 'preparing', 'ready_for_pickup'],
    ];

    public function handle(?User $user, Order $order, string $action, ?string $reason = null): JsonResponse
    {
        if (!$user || $user->role !== 'pharmacist') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pharmacists can update order status.',
            ], 403);
        }

        $pharmacistProfile = $user->pharmacist;
        if (!$pharmacistProfile) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pharmacist profile not found.',
            ], 403);
        }

        if (!is_null($user->branch_id) && $order->branch_id !== $user->branch_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not allowed to update this order.',
            ], 403);
        }

        if (!array_key_exists($action, self::ACTION_TO_STATUS)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unsupported pharmacist action.',
            ], 422);
        }

        $allowedCurrentStatuses = self::ACTION_ALLOWED_CURRENT_STATUSES[$action];
        if (!in_array($order->status, $allowedCurrentStatuses, true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'This order cannot be updated to the requested status.',
            ], 422);
        }

        if ($action === 'reject' && blank($reason)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Reason is required when rejecting an order.',
            ], 422);
        }

        $nextStatus = self::ACTION_TO_STATUS[$action];

        $updatePayload = [
            'status' => $nextStatus,
            'verified_by' => $user->id,
            'verified_at' => now(),
        ];

        if ($nextStatus === 'cancelled') {
            $updatePayload['cancelled_at'] = now();
            $updatePayload['cancellation_reason'] = 'Rejected by pharmacist: ' . trim((string) $reason);
        }

        if ($nextStatus === 'completed') {
            $updatePayload['completed_at'] = now();
            $updatePayload['picked_up_at'] = now();
        }

        $order->update($updatePayload);

        $successMessage = match ($action) {
            'approve' => 'Order approved successfully.',
            'ready' => 'Order marked as ready for pickup.',
            'complete' => 'Order marked as completed.',
            'pending' => 'Order marked as pending successfully.',
            default => 'Order rejected successfully.',
        };

        return response()->json([
            'status' => 'success',
            'message' => $successMessage,
            'data' => $order->fresh(),
        ]);
    }
}