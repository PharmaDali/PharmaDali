<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class ListOrdersService
{
    private const TAB_STATUS_MAP = [
        'for_review'  => ['pending', 'reviewing'],
        'For Review'  => ['pending', 'reviewing'],
        'preparing'   => ['preparing'],
        'Preparing'   => ['preparing'],
        'issues'      => ['cancelled', 'rejected', 'stand_by'],
        'Issues'      => ['cancelled', 'rejected', 'stand_by'],
        'for_pickup'  => ['ready_for_pickup'],
        'For Pickup'  => ['ready_for_pickup'],
        'completed'   => ['completed'],
        'Completed'   => ['completed'],
        'expired'     => ['overdue'],
        'Expired'     => ['overdue'],
    ];

    public function handle(?User $user): JsonResponse
    {
        if (!$user) {
            return response()->json([
                'status'  => 'error',
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
                'items.pharmacyProduct.category:id,category_name,background_color',
                'items.pharmacyProduct.product:id,product_name,generic_name,brand_name,description,form,strength,size,is_prescribed,image_path',
                'items.orderItemPrescription:id,order_item_id,prescription_image_path,status,verified_by,verified_at,rejection_reason',
                'items.orderItemPrescription.verifier:id,first_name,last_name,email,pharmacy_id,role',
            ])
            ->latest('id');

        if ($user->role === 'customer') {
            if (!$user->customer) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'Customer profile not found.',
                ], 403);
            }

            $query->where('customer_id', $user->customer->id);
        } elseif (in_array($user->role, ['pharmacy_admin', 'pharmacist'], true)) {
            if ($user->role === 'pharmacist' && request('scope_my_sales')) {
                $query->where('verified_by', $user->id);
            }
        } else {
            return response()->json([
                'status'  => 'error',
                'message' => 'You are not allowed to view orders.',
            ], 403);
        }

        // Apply Tab / Status Filter if provided
        $tab = request('tab');
        $statusParam = request('status');

        if ($tab && isset(self::TAB_STATUS_MAP[$tab])) {
            $query->whereIn('status', self::TAB_STATUS_MAP[$tab]);
        } elseif ($statusParam) {
            $statuses = array_filter(array_map('trim', explode(',', $statusParam)));
            if (!empty($statuses)) {
                $query->whereIn('status', $statuses);
            }
        }

        // Check if pagination parameters or filtering was requested
        $isPaginated = request()->has('page') || request()->has('per_page') || request()->has('tab') || request()->has('status');

        if ($isPaginated) {
            $perPage = max(1, min((int) request('per_page', 10), 100));
            $paginator = $query->paginate($perPage);

            return response()->json([
                'status'       => 'success',
                'data'         => $paginator->items(),
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
                'has_more'     => $paginator->hasMorePages(),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data'   => $query->get(),
        ]);
    }
}
