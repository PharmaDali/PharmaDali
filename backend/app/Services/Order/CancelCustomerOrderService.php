<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use App\Services\Messaging\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;   
use App\Notifications\OrderStatusNotification;
use App\Enums\OrderStatus;

class CancelCustomerOrderService
{
    public function __construct(
        private readonly ConversationService $conversationService,
    ) {}

    private const CUSTOMER_EDITABLE_STATUSES = [OrderStatus::PENDING, OrderStatus::REVIEWING];

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
            'status' => OrderStatus::CANCELLED,
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);

        try {
            $user->notify(new OrderStatusNotification($order->fresh()));
        } catch (\Throwable $notifException) {
            Log::warning('Customer cancellation notification dispatch error: ' . $notifException->getMessage());
        }

        $msg = $this->conversationService->appendSystemMessage($order, 'Order cancelled by customer', [
            'reason' => $reason,
            'status' => 'cancelled',
        ]);

        try {
            $msg->conversation()->update([
                'status' => 'closed',
                'closed_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to close conversation on customer cancel: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Order cancelled successfully.',
            'data' => $order->fresh(),
        ]);
    }
}
