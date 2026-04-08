<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class CancelPharmacistOrderService
{
    private const PHARMACIST_CANCELLABLE_STATUSES = ['pending', 'reviewing', 'preparing', 'ready_for_pickup'];

    public function handle(?User $user, Order $order, string $reason): JsonResponse
    {
        if (!$user || $user->role !== 'pharmacist') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pharmacists can cancel orders.',
            ], 403);
        }

        if (!is_null($user->branch_id) && $order->branch_id !== $user->branch_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not allowed to cancel this order.',
            ], 403);
        }

        if (!in_array($order->status, self::PHARMACIST_CANCELLABLE_STATUSES, true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'This order can no longer be cancelled.',
            ], 422);
        }

        $order->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => 'Cancelled by pharmacist: ' . $reason,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Order cancelled successfully.',
            'data' => $order->fresh(),
        ]);
    }
}
