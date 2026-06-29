<?php

namespace App\Services\Inventory;

use App\Models\InventoryLog;
use App\Models\PharmacyProduct;
use App\Repositories\ProductBatchRepository;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function __construct(
        private readonly ProductBatchRepository $batchRepository,
    ) {}

    public function getInventoryMetrics()
    {
        $today = Carbon::today()->toDateString();
        $expiringLimit = Carbon::today()->addDays(30)->toDateString();

        $totalProducts = PharmacyProduct::count();

        $lowStocks = PharmacyProduct::where('stock', '<=', 50)
            ->count();

        $expiring = PharmacyProduct::whereHas('batches', function ($q) use ($today, $expiringLimit) {
            $q->whereNotNull('expiry_date')
              ->where('stock', '>', 0)
              ->where('expiry_date', '>', $today)
              ->where('expiry_date', '<=', $expiringLimit);
        })->count();

        $expired = PharmacyProduct::whereHas('batches', function ($q) use ($today) {
            $q->whereNotNull('expiry_date')
              ->where('stock', '>', 0)
              ->where('expiry_date', '<=', $today);
        })->count();

        return [
            'total_products' => $totalProducts,
            'low_stocks' => $lowStocks,
            'expiring' => $expiring,
            'expired' => $expired,
        ];
    }

    public function getTotalProductCount()
    {
        return PharmacyProduct::count();
    }

    public function getInventoryProducts(array $filters = [])
    {
        $query = PharmacyProduct::with(['product', 'category', 'batches']);

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

        $today = Carbon::today();
        $expiringLimit = Carbon::today()->addDays(30);

        // Filter by status
        if (!empty($filters['status']) && $filters['status'] !== 'All') {
            $status = $filters['status'];
            if ($status === 'Expired') {
                $query->whereHas('batches', function ($q) use ($today) {
                    $q->whereNotNull('expiry_date')
                      ->where('stock', '>', 0)
                      ->where('expiry_date', '<=', $today->toDateString());
                });
            } elseif ($status === 'Expiring soon') {
                $query->whereHas('batches', function ($q) use ($today, $expiringLimit) {
                    $q->whereNotNull('expiry_date')
                      ->where('stock', '>', 0)
                      ->where('expiry_date', '>', $today->toDateString())
                      ->where('expiry_date', '<=', $expiringLimit->toDateString());
                });
            } elseif ($status === 'Low Stocks') {
                $query->where('stock', '<=', 50);
            } elseif ($status === 'Normal') {
                $query->where('stock', '>', 50)
                    ->whereDoesntHave('batches', function ($q) use ($expiringLimit) {
                        $q->whereNotNull('expiry_date')
                          ->where('stock', '>', 0)
                          ->where('expiry_date', '<=', $expiringLimit->toDateString());
                    });
            }
        }

        $pharmacyProducts = $query->get();

        return $pharmacyProducts->map(function ($bp) use ($today) {
            $product  = $bp->product;
            $category = $bp->category;

            // Determine the earliest active expiration date from batches
            $earliestBatch = $bp->batches
                ->whereNotNull('expiry_date')
                ->where('stock', '>', 0)
                ->sortBy('expiry_date')
                ->first();
                
            $earliestExpiryDate = $earliestBatch ? Carbon::parse($earliestBatch->expiry_date) : null;
            $earliestManufacturedDate = $earliestBatch ? Carbon::parse($earliestBatch->manufactured_date) : null;

            $expiringInDays = 365; // default if no expiry set
            if ($earliestExpiryDate) {
                $expiringInDays = (int) $today->diffInDays($earliestExpiryDate, false);
            }

            // Determine status
            $status = 'Normal';
            if ($earliestExpiryDate && $expiringInDays <= 0) {
                $status = 'Expired';
            } elseif ($earliestExpiryDate && $expiringInDays <= 30) {
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
                'expiryDate'     => $earliestExpiryDate?->toDateString(),
                'manufacturedDate' => $earliestManufacturedDate?->toDateString(),
                'velocity'       => $velocity,
                'sellingPrice'   => (float) $bp->selling_price,
                'status'         => $status,
                'is_available'   => $bp->is_available,
                'is_discountable'=> $bp->is_discountable,
                'product_id'     => $product->id ?? null,
                'product_type'   => $product->product_type ?? 'medicine',
                'batches'        => $batches,
            ];
        });
    }

    public function getInventoryLogs(array $filters = [])
    {
        $query = InventoryLog::with(['pharmacyProduct.product', 'user']);

        // Filter by product name search
        if (!empty($filters['search'])) {
            $search = '%' . strtolower($filters['search']) . '%';
            $query->whereHas('pharmacyProduct.product', function ($q) use ($search) {
                $q->whereRaw('LOWER(product_name) LIKE ?', [$search]);
            });
        }

        // Filter by transaction type (action)
        if (!empty($filters['action']) && strtolower($filters['action']) !== 'all') {
            $typeMap = [
                'stock in'   => 'stock_in',
                'stock out'  => 'stock_out',
                'adjustment' => 'adjustment',
                'waste'      => 'waste',
            ];
            $mapped = $typeMap[strtolower($filters['action'])] ?? strtolower($filters['action']);
            $query->where('transaction_type', $mapped);
        }

        // Filter by date
        if (!empty($filters['date_range'])) {
            $query->whereDate('created_at', $filters['date_range']);
        }

        return $query->latest()->get()->map(function ($log) {
            return [
                'id'          => 'LOG-' . str_pad($log->id, 5, '0', STR_PAD_LEFT),
                'productName' => $log->pharmacyProduct->product->product_name ?? 'Unknown Product',
                'action'      => ucwords(str_replace('_', ' ', $log->transaction_type)),
                'quantity'    => $log->quantity,
                'dateTime'    => $log->created_at->format('Y-m-d H:i'),
                'user'        => $log->user
                    ? ($log->user->first_name . ' ' . $log->user->last_name)
                    : 'System',
                'reason'      => $log->reason,
            ];
        });
    }
}