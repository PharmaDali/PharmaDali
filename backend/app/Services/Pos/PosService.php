<?php

namespace App\Services\Pos;

use App\Models\BranchProduct;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PosService
{
    /**
     * Get products for POS with infinite scroll and search functionality.
     */
    public function getProducts(array $filters)
    {
        $search = $filters['search'] ?? null;
        $perPage = $filters['per_page'] ?? 20;

        $query = BranchProduct::with(['product', 'category'])
            ->where('is_available', true);

        if ($search) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('product_name', 'like', "%{$search}%")
                  ->orWhere('generic_name', 'like', "%{$search}%")
                  ->orWhere('brand_name', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Create a new order from the POS.
     */
    public function createOrder(array $data, $user)
    {
        if (!$user) {
            throw new \Exception("Unauthorized");
        }

        return DB::transaction(function () use ($data, $user) {
            $orderTotal = 0;
            $items = $data['items'] ?? [];

            // Calculate total and validate stock
            foreach ($items as $item) {
                $branchProduct = BranchProduct::findOrFail($item['id']);
                
                if ($branchProduct->stock < $item['qty']) {
                    throw new \Exception("Insufficient stock for product: " . ($branchProduct->product->product_name ?? 'Item'));
                }

                $orderTotal += $item['qty'] * $branchProduct->selling_price;
            }

            // Create the order
            $order = Order::create([
                'order_number' => 'POS-' . strtoupper(Str::random(10)),
                'branch_id' => $user->branch_id ?? 1, // Defaulting to 1 for now if no branch associated
                'status' => 'completed',
                'verified_by' => $user->id,
                'verified_at' => now(),
                'payment_method' => $data['payment_method'] ?? 'cash',
                'payment_status' => 'paid',
                'subtotal' => $orderTotal,
                'total_amount' => $orderTotal,
                'amount_received' => $data['amount_received'] ?? $orderTotal,
                'change_amount' => $data['change_amount'] ?? 0,
                'placed_at' => now(),
                'completed_at' => now(),
                'note' => $data['note'] ?? 'POS Walk-in Sale',
            ]);

            // Create order items and update stock
            foreach ($items as $item) {
                $branchProduct = BranchProduct::with('product')->findOrFail($item['id']);
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'branch_product_id' => $branchProduct->id,
                    'quantity' => $item['qty'],
                    'unit_price_snapshot' => $branchProduct->selling_price,
                    'line_total' => $item['qty'] * $branchProduct->selling_price,
                    'product_name' => $branchProduct->product->product_name ?? 'Unknown Product',
                ]);

                // Update stock
                $branchProduct->decrement('stock', $item['qty']);
            }

            return $order;
        });
    }

    /**
     * Get pickup orders for the branch with search and filtering.
     */
    public function getPickupOrders(array $filters, $user)
    {
        if (!$user) {
            throw new \Exception("Unauthorized");
        }

        $branchId = $user->branch_id;
        $search = $filters['search'] ?? null;
        $status = $filters['status'] ?? 'all'; // all, ready, completed

        $query = Order::with([
            'customer.user:id,first_name,last_name',
            'items.branchProduct.product:id,product_name,generic_name',
            'items.branchProduct.category:id,category_name'
        ])
        ->whereNotNull('customer_id'); // Pickup orders always have a customer

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        // Status Filtering
        if ($status === 'ready') {
            $query->where('status', 'ready_for_pickup');
        } elseif ($status === 'completed') {
            $query->where('status', 'completed');
        } else {
            // 'all' includes ready and completed by default for this tab, 
            $query->whereIn('status', ['ready_for_pickup', 'completed']);
        }

        // Search functionality
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer.user', function ($uq) use ($search) {
                      $uq->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                  });
            });
        }

        return $query->latest()->get();
    }

    /**
     * Complete a pickup order and update payment info.
     */
    public function completePickupOrder(Order $order, string $paymentMethod, $user, $amountReceived = null, $changeAmount = null)
    {
        if ($order->branch_id !== $user->branch_id) {
            throw new \Exception("Unauthorized: Order does not belong to your branch.");
        }

        if ($order->status === 'completed') {
            throw new \Exception("Order is already completed.");
        }

        if ($order->status !== 'ready_for_pickup') {
            throw new \Exception("Order must be in 'ready_for_pickup' status to be completed at POS.");
        }

        return DB::transaction(function () use ($order, $paymentMethod, $amountReceived, $changeAmount) {
            $order->update([
                'status' => 'completed',
                'payment_method' => $paymentMethod,
                'payment_status' => 'paid',
                'amount_received' => $amountReceived ?? $order->total_amount,
                'change_amount' => $changeAmount ?? 0,
                'completed_at' => now(),
                'picked_up_at' => now(),
            ]);

            return $order->load(['customer.user', 'items.branchProduct.product']);
        });
    }
}
