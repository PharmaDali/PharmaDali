<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ReviewOrderService
{
    public function handle(?User $user, Order $order): JsonResponse
    {
        if (!$user || $user->role !== 'customer') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only customers can review their orders.',
            ], 403);
        }

        if (!$user->customer || $order->customer_id !== $user->customer->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not allowed to review this order.',
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Order review loaded successfully.',
            'data' => $order->load([
                'pharmacy:id,pharmacy_name,location',
                'items:id,order_id,pharmacy_product_id,quantity,unit_price_snapshot,line_total,product_name',
            ]),
        ]);
    }
}
