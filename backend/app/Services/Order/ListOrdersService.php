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
                'branch:id,branch_name,location',
                'verifier:id,first_name,last_name,email,branch_id,role',
                'items:id,order_id,branch_product_id,quantity,unit_price_snapshot,line_total,product_name',
                'items.branchProduct:id,branch_id,product_id,selling_price',
                'items.branchProduct.product:id,product_name,generic_name,brand_name,description,form,strength,is_prescribed',
                'items.orderItemPrescription:id,order_item_id,prescription_image_path,status,verified_by,verified_at,rejection_reason',
                'items.orderItemPrescription.verifier:id,first_name,last_name,email,branch_id,role',
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
        } elseif (in_array($user->role, ['branch_admin', 'pharmacist'], true)) {
            if (!is_null($user->branch_id)) {
                $query->where('branch_id', $user->branch_id);
            }
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
