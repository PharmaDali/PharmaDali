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
        } elseif (in_array($user->role, ['pharmacy_admin', 'pharmacist'], true)) {
            if (!is_null($user->pharmacy_id) && $order->pharmacy_id !== $user->pharmacy_id) {
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
                'pharmacy:id,pharmacy_name,location',
                'verifier:id,first_name,last_name,email,pharmacy_id,role',
                'items:id,order_id,pharmacy_product_id,quantity,unit_price_snapshot,line_total,product_name',
                'items.pharmacyProduct:id,pharmacy_id,product_id,selling_price',
                'items.pharmacyProduct.product:id,product_name,generic_name,brand_name,description,form,strength,is_prescribed',
                'items.orderItemPrescription:id,order_item_id,prescription_image_path,status,verified_by,verified_at,rejection_reason',
                'items.orderItemPrescription.verifier:id,first_name,last_name,email,pharmacy_id,role',
            ]),
        ]);
    }
}
