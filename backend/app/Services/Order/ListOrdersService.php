<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ListOrdersService
{
    public function handle(?User $user): JsonResponse
    {
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $query = Order::query()
            ->with([
                'customer:id,user_id',
                'customer.user:id,first_name,last_name,email',
                'pharmacy:id,pharmacy_name,location',
                'verifier:id,first_name,last_name,email,pharmacy_id,role',
                'items:id,order_id,pharmacy_product_id,quantity,unit_price_snapshot,line_total,product_name',
                'items.pharmacyProduct:id,pharmacy_id,product_id,category_id,selling_price',
                'items.pharmacyProduct.category:id,category_name',
                'items.pharmacyProduct.product:id,product_name,generic_name,brand_name,description,form,strength,size,is_prescribed',
                'items.orderItemPrescription:id,order_item_id,prescription_image_path,status,verified_by,verified_at,rejection_reason',
                'items.orderItemPrescription.verifier:id,first_name,last_name,email,pharmacy_id,role',
            ])
            ->latest('id');

        if ($user->role === 'customer') {
            if (!$user->customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Customer profile not found.',
                ], 403);
            }

            $query->where('customer_id', $user->customer->id);
        } elseif (in_array($user->role, ['pharmacy_admin', 'pharmacist'], true)) {
            // Auto-scoped by BelongsToTenant

        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not allowed to view orders.',
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $query->get(),
        ]);
    }
}
