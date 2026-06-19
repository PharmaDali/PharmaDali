<?php

namespace App\Services\Inventory;

use App\Models\PharmacyProduct;
use App\Repositories\ProductBatchRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function __construct(
        private readonly ProductBatchRepository $batchRepository,
    ) {}

    public function getInventoryMetrics($pharmacyId)
    {
        $today = Carbon::today()->toDateString();
        $expiringLimit = Carbon::today()->addDays(30)->toDateString();

        $totalProducts = PharmacyProduct::where('pharmacy_id', $pharmacyId)->count();

        $lowStocks = PharmacyProduct::where('pharmacy_id', $pharmacyId)
            ->where('stock', '<=', 50)
            ->count();

        $expiring = PharmacyProduct::where('pharmacy_id', $pharmacyId)
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '>', $today)
            ->where('expiry_date', '<=', $expiringLimit)
            ->count();

        $expired = PharmacyProduct::where('pharmacy_id', $pharmacyId)
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '<=', $today)
            ->count();

        return [
            'total_products' => $totalProducts,
            'low_stocks' => $lowStocks,
            'expiring' => $expiring,
            'expired' => $expired,
        ];
    }

    public function getInventoryProducts($pharmacyId, array $filters = [])
    {
        $query = PharmacyProduct::with(['product', 'category', 'batches'])
            ->where('pharmacy_id', $pharmacyId);

        // Filter by search / query
        if (!empty($filters['search'])) {
            $search = '%' . strtolower($filters['search']) . '%';
            $query->whereHas('product', function ($q) use ($search) {
                $q->where(DB::raw('LOWER(product_name)'), 'like', $search)
                  ->orWhere(DB::raw('LOWER(brand_name)'), 'like', $search)
                  ->orWhere(DB::raw('LOWER(generic_name)'), 'like', $search);
            });
        }

        // Filter by category
        if (!empty($filters['category']) && $filters['category'] !== 'All') {
            $category = $filters['category'];
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('category_name', $category);
            });
        }

        // Filter by price_range / price
        if (!empty($filters['price_range']) && $filters['price_range'] !== 'All') {
            $priceRange = preg_replace('/\s+/', ' ', trim($filters['price_range']));

            $priceRangeMap = [
                'Below 10'     => fn ($q) => $q->where('selling_price', '<', 10),
                '10 - 50'      => fn ($q) => $q->whereBetween('selling_price', [10, 50]),
                '51 - 100'     => fn ($q) => $q->whereBetween('selling_price', [51, 100]),
                '101 - 200'    => fn ($q) => $q->whereBetween('selling_price', [101, 200]),
                '200 - 500'    => fn ($q) => $q->whereBetween('selling_price', [200, 500]),
                '500 and above'=> fn ($q) => $q->where('selling_price', '>=', 500),
            ];

            if (array_key_exists($priceRange, $priceRangeMap)) {
                $priceRangeMap[$priceRange]($query);
            }
        }

        // Filter by stock_range / stock
        if (!empty($filters['stock_range']) && $filters['stock_range'] !== 'All') {
            $stockRange = $filters['stock_range'];
            if ($stockRange === 'Below 10') {
                $query->where('stock', '<', 10);
            } elseif ($stockRange === '10 - 50') {
                $query->whereBetween('stock', [10, 50]);
            } elseif ($stockRange === '51 - 100') {
                $query->whereBetween('stock', [51, 100]);
            } elseif ($stockRange === '101 - 200') {
                $query->whereBetween('stock', [101, 200]);
            } elseif ($stockRange === '200 - 500') {
                $query->whereBetween('stock', [200, 500]);
            } elseif ($stockRange === '500 and above') {
                $query->where('stock', '>=', 500);
            }
        }

        $today         = Carbon::today();
        $expiringLimit = Carbon::today()->addDays(30);

        // Filter by status
        if (!empty($filters['status']) && $filters['status'] !== 'All') {
            $status = $filters['status'];
            if ($status === 'Expired') {
                $query->whereNotNull('expiry_date')->where('expiry_date', '<=', $today->toDateString());
            } elseif ($status === 'Expiring soon') {
                $query->whereNotNull('expiry_date')
                    ->where('expiry_date', '>', $today->toDateString())
                    ->where('expiry_date', '<=', $expiringLimit->toDateString());
            } elseif ($status === 'Low Stocks') {
                $query->where('stock', '<=', 50);
            } elseif ($status === 'Normal') {
                $query->where('stock', '>', 50)
                    ->where(function ($q) use ($today, $expiringLimit) {
                        $q->whereNull('expiry_date')
                          ->orWhere('expiry_date', '>', $expiringLimit->toDateString());
                    });
            }
        }

        $pharmacyProducts = $query->get();

        return $pharmacyProducts->map(function ($bp) use ($today) {
            $product  = $bp->product;
            $category = $bp->category;

            $expiringInDays = 0;
            if ($bp->expiry_date) {
                $expiry         = Carbon::parse($bp->expiry_date);
                $expiringInDays = (int) $today->diffInDays($expiry, false);
            } else {
                $expiringInDays = 365; // default if no expiry set
            }

            // Determine status
            $status = 'Normal';
            if ($bp->expiry_date && $expiringInDays <= 0) {
                $status = 'Expired';
            } elseif ($bp->expiry_date && $expiringInDays <= 30) {
                $status = 'Expiring soon';
            } elseif ($bp->stock <= 50) {
                $status = 'Low Stocks';
            }

            // Dynamic velocity / fallback
            $velocity = 'Medium';
            if ($bp->stock > 200) {
                $velocity = 'Fast';
            } elseif ($bp->stock < 20) {
                $velocity = 'Slow';
            }

            $strengthFormParts = array_filter([$product->strength ?? '', $product->form ?? '', $product->size ?? '']);
            $formLabel = !empty($strengthFormParts) ? implode(' ', $strengthFormParts) : ($product->form ?? 'Medicine');

            // Map batches with per-batch expiry status
            $batches = $bp->batches->sortBy('expiry_date')->map(function ($batch) use ($today) {
                $batchExpiringInDays = null;
                $batchStatus         = 'Normal';

                if ($batch->expiry_date) {
                    $batchExpiringInDays = (int) $today->diffInDays($batch->expiry_date, false);

                    if ($batchExpiringInDays <= 0) {
                        $batchStatus = 'Expired';
                    } elseif ($batchExpiringInDays <= 30) {
                        $batchStatus = 'Expiring soon';
                    }
                }

                return [
                    'id'                => $batch->id,
                    'batch_number'      => $batch->batch_number,
                    'stock'             => $batch->stock,
                    'expiry_date'       => $batch->expiry_date?->toDateString(),
                    'manufactured_date' => $batch->manufactured_date?->toDateString(),
                    'received_at'       => $batch->received_at?->toDateTimeString(),
                    'expiring_in_days'  => $batchExpiringInDays,
                    'status'            => $batchStatus,
                ];
            })->values();

            return [
                'id'             => $bp->id,
                'name'           => $product->product_name ?? 'Unknown',
                'brand'          => $product->brand_name ?? 'Generic',
                'form'           => $formLabel,
                'raw_form'       => $product->form ?? '',
                'strength'       => $product->strength ?? '',
                'size'           => $bp->product->size ?? '',
                'category'       => $category->category_name ?? 'Uncategorized',
                'quantity'       => $bp->stock,
                'reorderPoint'   => 50,
                'expiringInDays' => $expiringInDays,
                'expiryDate'     => $bp->expiry_date,
                'velocity'       => $velocity,
                'sellingPrice'   => (float) $bp->selling_price,
                'status'         => $status,
                'is_available'   => $bp->is_available,
                'is_discountable'=> $bp->is_discountable,
                'product_id'     => $product->id ?? null,
                'batches'        => $batches,
            ];
        });
    }

    public function getInventoryLogs($pharmacyId, array $filters = [])
    {
        $search = strtolower($filters['search'] ?? '');
        $action = $filters['action'] ?? 'All';
        $dateRange = $filters['date_range'] ?? '';

        $logs = collect();

        // 1. Stock OUT logs from orders
        $ordersQuery = \App\Models\Order::with(['items.pharmacyProduct.product', 'user'])
            ->where('pharmacy_id', $pharmacyId)
            ->where('status', 'completed');

        if ($dateRange) {
            $ordersQuery->whereDate('placed_at', $dateRange);
        }

        $orders = $ordersQuery->get();

        foreach ($orders as $order) {
            foreach ($order->items as $item) {
                $productName = $item->pharmacyProduct->product->product_name ?? $item->product_name ?? 'Product';
                
                // apply search criteria
                if ($search && strpos(strtolower($productName), $search) === false) {
                    continue;
                }

                if ($action !== 'All' && strtolower($action) !== 'stock out') {
                    continue;
                }

                $logs->push([
                    'id' => 'LOG-OUT' . str_pad($item->id, 4, '0', STR_PAD_LEFT),
                    'productName' => $productName,
                    'action' => 'Stock OUT',
                    'quantity' => $item->quantity,
                    'dateTime' => Carbon::parse($order->placed_at ?? $order->created_at)->format('Y-m-d H:i'),
                    'user' => $order->user ? ($order->user->first_name . ' ' . $order->user->last_name) : 'System',
                ]);
            }
        }

        // 2. Generate stock IN simulated/historical logs for any pharmacy products
        $bpQuery = PharmacyProduct::with('product')->where('pharmacy_id', $pharmacyId);
        $bps = $bpQuery->get();

        foreach ($bps as $bp) {
            $productName = $bp->product->product_name ?? 'Product';

            if ($search && strpos(strtolower($productName), $search) === false) {
                continue;
            }

            if ($action !== 'All' && strtolower($action) !== 'stock in') {
                continue;
            }

            $date = Carbon::parse($bp->created_at);
            if ($dateRange && $date->toDateString() !== $dateRange) {
                continue;
            }

            $logs->push([
                'id' => 'LOG-IN' . str_pad($bp->id, 4, '0', STR_PAD_LEFT),
                'productName' => $productName,
                'action' => 'Stock IN',
                'quantity' => $bp->stock + 100, // simulated initial stock in
                'dateTime' => $date->format('Y-m-d H:i'),
                'user' => 'Denmar Redondo',
            ]);
        }

        return $logs->sortByDesc('dateTime')->values();
    }
}