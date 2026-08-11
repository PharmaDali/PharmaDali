<?php

namespace App\Services\Order\Actions;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class CreateOrderFromCart
{
    /**
     * Create Order and OrderItem records from active cart inside a DB transaction and cleanup cart.
     */
    public function execute(
        Cart $activeCart,
        Collection $cartItems,
        array $payload,
        int $customerId,
        Collection $selectedCartItemIds
    ): Order {
        return DB::transaction(function () use ($activeCart, $cartItems, $payload, $customerId, $selectedCartItemIds) {
            $timestamp = now();

            $rawScheduledPickup = $payload['scheduled_pickup_at'] ?? null;
            $scheduledPickupAt = $timestamp;
            if ($rawScheduledPickup) {
                try {
                    $parsed = Carbon::parse($rawScheduledPickup);
                    $scheduledPickupAt = $parsed->isPast() ? $timestamp : $parsed;
                } catch (\Throwable) {
                    $scheduledPickupAt = $timestamp;
                }
            }

            $order = Order::query()->create([
                'order_number' => $this->generateOrderNumber(),
                'customer_id' => $customerId,
                'pharmacy_id' => $activeCart->pharmacy_id,
                'status' => 'pending',
                'payment_method' => $payload['payment_method'],
                'payment_status' => 'unpaid',
                'subtotal' => 0,
                'discount_amount' => 0,
                'total_amount' => 0,
                'scheduled_pickup_at' => $scheduledPickupAt,
                'picked_up_at' => $payload['picked_up_at'] ?? null,
                'note' => $payload['note'] ?? null,
                'placed_at' => $timestamp,
            ]);

            [$orderItemRows, $subtotal] = $this->buildOrderItemRows($order->id, $cartItems, $timestamp);

            if (!empty($orderItemRows)) {
                OrderItem::query()->insert($orderItemRows);
            }

            $order->update([
                'subtotal' => $subtotal,
                'total_amount' => $subtotal,
            ]);

            $this->cleanupCartAfterOrder($activeCart, $selectedCartItemIds);

            return $order->load([
                'customer:id,user_id',
                'customer.user:id,first_name,last_name,email',
                'pharmacy:id,pharmacy_name,location',
                'items:id,order_id,pharmacy_product_id,quantity,unit_price_snapshot,line_total,product_name',
            ]);
        });
    }

    /**
     * Build order item rows for bulk insertion and calculate subtotal.
     */
    private function buildOrderItemRows(int $orderId, Collection $cartItems, $timestamp): array
    {
        $subtotal = 0;
        $orderItemRows = [];

        foreach ($cartItems as $cartItem) {
            $quantity = (int) $cartItem->quantity;
            $unitPrice = (float) $cartItem->price_snapshot;
            $lineTotal = round($quantity * $unitPrice, 2);
            $subtotal += $lineTotal;

            $productName = $cartItem->pharmacyProduct?->product?->product_name ?? 'Unknown Product';

            $orderItemRows[] = [
                'order_id' => $orderId,
                'pharmacy_product_id' => $cartItem->pharmacy_product_id,
                'quantity' => $quantity,
                'unit_price_snapshot' => $unitPrice,
                'line_total' => $lineTotal,
                'product_name' => $productName,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ];
        }

        return [$orderItemRows, $subtotal];
    }

    /**
     * Remove checked out items from cart and mark cart completed if empty.
     */
    private function cleanupCartAfterOrder(Cart $activeCart, Collection $selectedCartItemIds): void
    {
        $activeCart->items()
            ->whereIn('id', $selectedCartItemIds)
            ->delete();

        if (!$activeCart->items()->exists()) {
            $activeCart->update([
                'status' => 'completed',
            ]);
        }
    }

    /**
     * Generate unique order number.
     */
    private function generateOrderNumber(): string
    {
        return 'ORD-' . now()->format('YmdHis') . '-' . random_int(1000, 9999);
    }
}
