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
}
