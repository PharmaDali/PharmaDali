<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class RejectPharmacistOrderService
{
    private const PHARMACIST_REJECTABLE_STATUSES = ['pending', 'reviewing'];

    public function handle(?User $user, Order $order, string $reason): JsonResponse
    {
        if (!$user || $user->role !== 'pharmacist') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pharmacists can reject orders.',
            ], 403);
        }

        if (!is_null($user->branch_id) && $order->branch_id !== $user->branch_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not allowed to reject this order.',
            ], 403);
        }

        if (!in_array($order->status, self::PHARMACIST_REJECTABLE_STATUSES, true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'This order can no longer be rejected.',
            ], 422);
        }

        $order->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => 'Rejected by pharmacist: ' . $reason,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Order rejected successfully.',
            'data' => $order->fresh(),
        ]);
    }
}
