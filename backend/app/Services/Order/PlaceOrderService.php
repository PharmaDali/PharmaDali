<?php

namespace App\Services\Order;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PlaceOrderService
{
    public function handle(?User $user, array $payload): JsonResponse
    {
        if (!$user || $user->role !== 'customer') {
            return response()->json([
                'status' => 'error',
                'message' => 'Only customers can place orders.',
            ], 403);
        }

        $customer = $user->customer;

        if (!$customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer profile not found.',
            ], 403);
        }

        $activeCart = Cart::query()
            ->where('status', 'active')
            ->where(function ($query) use ($customer, $user) {
                $query->where('customer_id', $customer->id)
                    ->orWhere('customer_id', $user->id);
            })
            ->latest('id')
            ->first();

        if (!$activeCart) {
            return response()->json([
                'status' => 'error',
                'message' => 'No active cart found for checkout.',
            ], 422);
        }

        $cartItems = $activeCart->items()
            ->with(['branchProduct.product:id,product_name'])
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot place an order with an empty cart.',
            ], 422);
        }

        $order = DB::transaction(function () use ($activeCart, $cartItems, $payload, $customer) {
            $timestamp = now();

            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'customer_id' => $customer->id,
                'branch_id' => $activeCart->branch_id,
                'status' => 'pending',
                'payment_method' => $payload['payment_method'],
                'payment_status' => 'unpaid',
                'subtotal' => 0,
                'discount_amount' => 0,
                'total_amount' => 0,
                'scheduled_pickup_at' => $payload['scheduled_pickup_at'] ?? null,
                'note' => $payload['note'] ?? null,
                'placed_at' => $timestamp,
            ]);

            $subtotal = 0;
            $orderItemRows = [];

            foreach ($cartItems as $cartItem) {
                $quantity = (int) $cartItem->quantity;
                $unitPrice = (float) $cartItem->price_snapshot;
                $lineTotal = round($quantity * $unitPrice, 2);
                $subtotal += $lineTotal;

                $productName = $cartItem->branchProduct?->product?->product_name ?? 'Unknown Product';

                $orderItemRows[] = [
                    'order_id' => $order->id,
                    'branch_product_id' => $cartItem->product_id,
                    'quantity' => $quantity,
                    'unit_price_snapshot' => $unitPrice,
                    'line_total' => $lineTotal,
                    'product_name' => $productName,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ];
            }

            if (!empty($orderItemRows)) {
                OrderItem::query()->insert($orderItemRows);
            }

            $order->update([
                'subtotal' => $subtotal,
                'total_amount' => $subtotal,
            ]);

            $activeCart->update([
                'status' => 'completed',
            ]);

            return $order->load([
                'customer:id,user_id',
                'customer.user:id,first_name,last_name,email',
                'branch:id,branch_name,location',
                'items:id,order_id,branch_product_id,quantity,unit_price_snapshot,line_total,product_name',
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Order placed successfully.',
            'data' => $order,
        ], 201);
    }

    private function generateOrderNumber(): string
    {
        return 'ORD-' . now()->format('YmdHis') . '-' . random_int(1000, 9999);
    }
}
