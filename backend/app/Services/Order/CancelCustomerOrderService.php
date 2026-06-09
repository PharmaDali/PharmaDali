<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use App\Services\Messaging\ConversationService;
use Illuminate\Http\JsonResponse;

class CancelCustomerOrderService
{
    public function __construct(
        private readonly ConversationService $conversationService,
    ) {}

    private const CUSTOMER_EDITABLE_STATUSES = ['pending', 'reviewing'];

    public function handle(?User $user, Order $order, string $reason): JsonResponse
    {
        if (!$user || $user->role !== 'customer') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only customers can cancel their orders.',
            ], 403);
        }

        if (!$user->customer || $order->customer_id !== $user->customer->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not allowed to cancel this order.',
            ], 403);
        }

        if (!in_array($order->status, self::CUSTOMER_EDITABLE_STATUSES, true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'This order can no longer be cancelled by the customer.',
            ], 422);
        }

        $order->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);

        $this->conversationService->appendSystemMessage($order, 'Order cancelled by customer', [
            'reason' => $reason,
            'status' => 'cancelled',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Order cancelled successfully.',
            'data' => $order->fresh(),
        ]);
    }
}
