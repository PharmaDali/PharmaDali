<?php

namespace App\Repositories;

use App\Models\PharmacyProduct;
use App\Models\Order;
use App\Models\OrderItem;

class PosRepository
{
    /**
     * Get available pharmacy products for POS search with pagination.
     */
    public function getAvailableProducts(array $filters)
    {
        $search = $filters['search'] ?? null;
        $perPage = $filters['per_page'] ?? 20;

        $query = PharmacyProduct::with(['product', 'category'])
            ->where('is_available', true);

        if ($search) {
            $query->whereHas('product', function ($pq) use ($search) {
                $pq->where('product_name', 'like', "%{$search}%")
                  ->orWhere('generic_name', 'like', "%{$search}%")
                  ->orWhere('brand_name', 'like', "%{$search}%")
                  ->orWhere('strength', 'like', "%{$search}%")
                  ->orWhere('form', 'like', "%{$search}%")
                  ->orWhere('size', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Find pharmacy product with product relation by ID.
     */
    public function findPharmacyProduct(int $id): PharmacyProduct
    {
        return PharmacyProduct::with('product')->findOrFail($id);
    }

    /**
     * Create a new Order record.
     */
    public function createOrder(array $data): Order
    {
        return Order::create($data);
    }

    /**
     * Create a new OrderItem record.
     */
    public function createOrderItem(array $data): OrderItem
    {
        return OrderItem::create($data);
    }

    /**
     * Decrement product stock using Eloquent save() to trigger PharmacyProductObserver events.
     */
    public function decrementStock(PharmacyProduct $product, int $quantity): void
    {
        $product->stock = max(0, $product->stock - $quantity);
        $product->save();
    }

    /**
     * Fetch pickup orders for a pharmacy with optional status and search filters.
     */
    public function getPickupOrders(?int $pharmacyId, string $statusInput = 'all', ?string $search = null)
    {
        $query = Order::with([
            'customer.user',
            'items.pharmacyProduct.product',
            'items.pharmacyProduct.category',
            'items.orderItemPrescription'
        ])
        ->whereNotNull('customer_id');

        if ($pharmacyId) {
            $query->where('pharmacy_id', $pharmacyId);
        }

        $normalizedStatus = strtolower(trim($statusInput));

        if (in_array($normalizedStatus, ['ready', 'ready_for_pickup', 'for_pickup', 'for pickup'], true)) {
            $query->where('status', 'ready_for_pickup');
        } elseif ($normalizedStatus === 'completed') {
            $query->where('status', 'completed');
        } else {
            $query->whereIn('status', ['ready_for_pickup', 'completed']);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer.user', function ($uq) use ($search) {
                      $uq->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('mobile_number', 'like', "%{$search}%");
                  });
            });
        }

        $orders = $query->latest()->get();

        $orders->transform(function ($order) {
            $user = $order->customer?->user;
            $order->customer_name = $user ? trim("{$user->first_name} {$user->last_name}") : ($order->customer_name ?? 'Customer');
            $order->customer_phone = $user?->mobile_number ?? $user?->phone ?? $order->customer_phone ?? null;
            return $order;
        });

        return $orders;
    }

    /**
     * Update an existing Order record.
     */
    public function updateOrder(Order $order, array $data): Order
    {
        $order->update($data);
        return $order;
    }
}
