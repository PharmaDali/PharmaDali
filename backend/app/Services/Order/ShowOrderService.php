<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ShowOrderService
{
    public function handle(?User $user, Order $order): JsonResponse
    {
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($user->role === 'customer') {
            if (!$user->customer || $order->customer_id !== $user->customer->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You are not allowed to view this order.',
                ], 403);
            }
        } elseif (in_array($user->role, ['branch_admin', 'pharmacist'], true)) {
            if (!is_null($user->branch_id) && $order->branch_id !== $user->branch_id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'You are not allowed to view this order.',
                ], 403);
            }
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not allowed to view this order.',
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $order->load([
                'customer:id,user_id',
                'customer.user:id,first_name,last_name,email',
                'branch:id,branch_name,location',
                'items:id,order_id,branch_product_id,quantity,unit_price_snapshot,line_total,product_name',
                'items.branchProduct:id,branch_id,product_id,selling_price',
                'items.branchProduct.product:id,product_name,generic_name,brand_name',
            ]),
        ]);
    }
}
