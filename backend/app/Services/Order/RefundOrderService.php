<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use App\Models\ProductBatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class RefundOrderService
{
    public function handle(?User $user, Order $order): JsonResponse
    {
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Check if user has permission
        if ($user->role === 'pharmacist' && !$user->pharmacist->hasPermission('process_cash_refund')) {
            return response()->json(['message' => 'You do not have permission to process cash refunds.'], 403);
        }

        // Verify order is not already refunded
        if ($order->is_refunded) {
            return response()->json(['message' => 'Order is already refunded.'], 400);
        }

        try {
            DB::beginTransaction();

            $order->is_refunded = true;
            $order->refunded_at = now();
            $order->save();

            // Revert inventory stock
            foreach ($order->items as $item) {
                if ($item->pharmacy_product_id) {
                    $pharmacyProduct = $item->pharmacyProduct;
                    if ($pharmacyProduct && $pharmacyProduct->track_inventory) {
                        $pharmacyProduct->stock += $item->quantity;
                        $pharmacyProduct->save();

                        $latestBatch = ProductBatch::where('pharmacy_product_id', $pharmacyProduct->id)
                            ->orderBy('expiration_date', 'asc')
                            ->first();

                        if ($latestBatch) {
                            $latestBatch->quantity += $item->quantity;
                            $latestBatch->save();
                        }
                    }
                }
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Refund processed successfully.',
                'order' => $order
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process refund: ' . $e->getMessage()
            ], 500);
        }
    }
}
