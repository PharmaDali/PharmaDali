<?php

namespace App\Services\BranchProduct;

use App\Models\BranchProduct;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Throwable;

class ShowBranchProductService
{
    private const CACHE_TTL_MINUTES = 5;

    private function getCacheKey(int $branchId, ?int $categoryId = null): string
    {
        return sprintf(
            'branch_products:%d:%s',
            $branchId,
            $categoryId !== null ? (string) $categoryId : 'all',
        );
    }

    public function invalidateBranch(int $branchId): void
    {
        try {
            Cache::forget($this->getCacheKey($branchId, null));

            $categoryIds = BranchProduct::query()
                ->where('branch_id', $branchId)
                ->whereNotNull('category_id')
                ->distinct()
                ->pluck('category_id');

            foreach ($categoryIds as $categoryId) {
                Cache::forget($this->getCacheKey($branchId, (int) $categoryId));
            }
        } catch (Throwable $exception) {
            // Continue without cache invalidation when Redis is unavailable.
        }
    }

    private function queryProducts(int $branchId, ?int $categoryId = null): Collection
    {
        $query = BranchProduct::query()
            ->with([
                'product:id,product_type,product_name,generic_name,brand_name,description,form,strength',
                'category:id,category_name,description',
            ])
            ->where('branch_id', $branchId)
            ->orderBy('product_id');

        if ($categoryId !== null) {
            $query->where('category_id', $categoryId);
        }

        return $query->get();
    }

    public function handle(int $branchId, ?int $categoryId = null, bool $forceRefresh = false): Collection
    {
        try {
            if ($forceRefresh) {
                $this->invalidateBranch($branchId);
            }

            $cacheKey = $this->getCacheKey($branchId, $categoryId);

            return Cache::remember($cacheKey, now()->addMinutes(self::CACHE_TTL_MINUTES), function () use ($branchId, $categoryId) {
                return $this->queryProducts($branchId, $categoryId);
            });
        } catch (Throwable $exception) {
            return $this->queryProducts($branchId, $categoryId);
        }
    }
}
