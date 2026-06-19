<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UpdateCustomerOrderService
{
    private const CUSTOMER_EDITABLE_STATUSES = ['pending', 'reviewing'];

    public function __construct(
        private readonly CancelCustomerOrderService $cancelCustomerOrderService,
    ) {}

    public function handle(?User $user, Order $order, array $payload): JsonResponse
    {
        if (($payload['status'] ?? null) === 'cancelled') {
            return $this->cancelCustomerOrderService->handle(
                $user,
                $order,
                $payload['reason'],
            );
        }

        if (!$user || $user->role !== 'customer') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only customers can update their orders.',
            ], 403);
        }

        if (!$user->customer || $order->customer_id !== $user->customer->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not allowed to update this order.',
            ], 403);
        }

        if (!in_array($order->status, self::CUSTOMER_EDITABLE_STATUSES, true)) {
            return response()->json([
                'status' => 'error',
                'message' => 'This order can no longer be updated.',
            ], 422);
        }

        $order->update([
            'payment_method' => $payload['payment_method'] ?? $order->payment_method,
            'scheduled_pickup_at' => array_key_exists('scheduled_pickup_at', $payload) ? $payload['scheduled_pickup_at'] : $order->scheduled_pickup_at,
            'note' => array_key_exists('note', $payload) ? $payload['note'] : $order->note,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Order updated successfully.',
            'data' => $order->fresh()->load([
                'pharmacy:id,pharmacy_name,location',
                'items:id,order_id,pharmacy_product_id,quantity,unit_price_snapshot,line_total,product_name',
            ]),
        ]);
    }
}
