<?php

namespace App\Services\Inventory;

use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class GetInventoryProductsService
{
    private int $lowStockThreshold;
    private int $expiryDaysThreshold;
    private Carbon $today;

    public function handle(array $filters = [], ?Pharmacy $pharmacy = null): Collection
    {
        $this->lowStockThreshold = $pharmacy?->low_stock_threshold ?? 50;
        $this->expiryDaysThreshold = $pharmacy?->expiry_days_threshold ?? 30;
        $this->today = Carbon::today();

        $query = PharmacyProduct::with(['product', 'category', 'batches']);
        $this->applyFilters($query, $filters);

        return $query->get()->map(fn (PharmacyProduct $bp) => $this->formatProduct($bp));
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['search'])) {
            $search = '%' . strtolower($filters['search']) . '%';
            $query->whereHas('product', function ($q) use ($search) {
                $q->where(DB::raw('LOWER(product_name)'), 'like', $search)
                  ->orWhere(DB::raw('LOWER(brand_name)'), 'like', $search)
                  ->orWhere(DB::raw('LOWER(generic_name)'), 'like', $search);
            });
        }

        if (!empty($filters['category']) && $filters['category'] !== 'All') {
            $query->whereHas('category', fn ($q) => $q->where('category_name', $filters['category']));
        }

        if (!empty($filters['price_range']) && $filters['price_range'] !== 'All') {
            $this->applyRangeFilter($query, preg_replace('/\s+/', ' ', trim($filters['price_range'])), 'selling_price');
        }

        if (!empty($filters['stock_range']) && $filters['stock_range'] !== 'All') {
            $this->applyRangeFilter($query, $filters['stock_range'], 'stock');
        }

        if (!empty($filters['status']) && $filters['status'] !== 'All') {
            $this->applyStatusFilter($query, $filters['status']);
        }
    }

    private function applyRangeFilter(Builder $query, string $range, string $column): void
    {
        $map = [
            'Below 10'      => fn ($q) => $q->where($column, '<', 10),
            '10 - 50'       => fn ($q) => $q->whereBetween($column, [10, 50]),
            '51 - 100'      => fn ($q) => $q->whereBetween($column, [51, 100]),
            '101 - 200'     => fn ($q) => $q->whereBetween($column, [101, 200]),
            '200 - 500'     => fn ($q) => $q->whereBetween($column, [200, 500]),
            '500 and above' => fn ($q) => $q->where($column, '>=', 500),
        ];

        if (isset($map[$range])) {
            $map[$range]($query);
        }
    }

    private function applyStatusFilter(Builder $query, string $status): void
    {
        $todayStr = $this->today->toDateString();
        $expiringLimit = $this->today->copy()->addDays($this->expiryDaysThreshold)->toDateString();

        if ($status === 'Expired') {
            $query->whereHas('batches', fn ($q) => $q
                ->whereNotNull('expiry_date')
                ->where('stock', '>', 0)
                ->where('expiry_date', '<=', $todayStr)
            );
        } elseif ($status === 'Expiring soon') {
            $query->whereHas('batches', fn ($q) => $q
                ->whereNotNull('expiry_date')
                ->where('stock', '>', 0)
                ->where('expiry_date', '>', $todayStr)
                ->where('expiry_date', '<=', $expiringLimit)
            );
        } elseif ($status === 'Low Stocks') {
            $query->where('stock', '<=', $this->lowStockThreshold);
        } elseif ($status === 'Healthy') {
            $query->where('stock', '>', $this->lowStockThreshold)
                ->whereDoesntHave('batches', fn ($q) => $q
                    ->whereNotNull('expiry_date')
                    ->where('stock', '>', 0)
                    ->where('expiry_date', '<=', $expiringLimit)
                );
        }
    }

    private function formatProduct(PharmacyProduct $bp): array
    {
        $product  = $bp->product;
        $category = $bp->category;

        // Sync product total stock with batch stock summation
        $realStock = $bp->batches->count() > 0 ? $bp->batches->sum('stock') : $bp->stock;
        if ($bp->batches->count() > 0 && (int) $bp->stock !== (int) $realStock) {
            $bp->stock = $realStock;
            $bp->save();
        }

        // Determine nearest active FEFO batch expiry
        $earliestBatch = $bp->batches
            ->whereNotNull('expiry_date')
            ->where('stock', '>', 0)
            ->sortBy('expiry_date')
            ->first();

        $earliestExpiryDate = $earliestBatch ? Carbon::parse($earliestBatch->expiry_date) : null;
        $earliestManufacturedDate = $earliestBatch ? Carbon::parse($earliestBatch->manufactured_date) : null;
        $expiringInDays = $earliestExpiryDate ? (int) $this->today->diffInDays($earliestExpiryDate, false) : 365;

        // Compute FEFO status
        $status = match (true) {
            $earliestExpiryDate !== null && $expiringInDays <= 0 => 'Expired',
            $earliestExpiryDate !== null && $expiringInDays <= $this->expiryDaysThreshold => 'Expiring soon',
            $realStock <= $this->lowStockThreshold => 'Low Stocks',
            default => 'Healthy',
        };

        $strengthFormParts = array_filter([$product->strength ?? '', $product->form ?? '', $product->size ?? '']);

        return [
            'id'               => $bp->id,
            'name'             => $product->product_name ?? 'Unknown',
            'brand'            => $product->brand_name ?? '',
            'form'             => !empty($strengthFormParts) ? implode(' ', $strengthFormParts) : ($product->form ?? 'Medicine'),
            'raw_form'         => $product->form ?? '',
            'strength'         => $product->strength ?? '',
            'size'             => $product->size ?? '',
            'category'         => $category->category_name ?? 'Uncategorized',
            'quantity'         => $realStock,
            'reorderPoint'     => 50,
            'expiringInDays'   => $expiringInDays,
            'expiryDate'       => $earliestExpiryDate?->toDateString(),
            'manufacturedDate' => $earliestManufacturedDate?->toDateString(),
            'velocity'         => match (true) {
                $realStock > 200 => 'Fast',
                $realStock < 20  => 'Slow',
                default          => 'Medium',
            },
            'sellingPrice'     => (float) $bp->selling_price,
            'status'           => $status,
            'is_available'     => $bp->is_available,
            'is_discountable'  => $bp->is_discountable,
            'product_id'       => $product->id ?? null,
            'product_type'     => $product->product_type ?? 'medicine',
            'image_url'        => $product->image_url ?? null,
            'batches'          => $this->formatBatches(collect($bp->batches)),
        ];
    }

    private function formatBatches(Collection $batches): array
    {
        return $batches
            ->filter(fn ($b) => (int) $b->stock > 0)
            ->sortBy('expiry_date')
            ->map(function ($batch) {
                $expiringInDays = null;
                $status = 'Healthy';

                if ($batch->expiry_date) {
                    $expiringInDays = (int) $this->today->diffInDays($batch->expiry_date, false);
                    $status = match (true) {
                        $expiringInDays <= 0  => 'Expired',
                        $expiringInDays <= 30 => 'Expiring soon',
                        default               => 'Healthy',
                    };
                }

                return [
                    'id'                => $batch->id,
                    'batch_number'      => $batch->batch_number,
                    'stock'             => $batch->stock,
                    'expiry_date'       => $batch->expiry_date?->toDateString(),
                    'manufactured_date' => $batch->manufactured_date?->toDateString(),
                    'received_at'       => $batch->received_at?->toDateTimeString(),
                    'expiring_in_days'  => $expiringInDays,
                    'status'            => $status,
                ];
            })->values()->toArray();
    }
}
