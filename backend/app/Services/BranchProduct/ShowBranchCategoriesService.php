<?php

namespace App\Services\BranchProduct;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Throwable;

class ShowBranchCategoriesService
{
    private const CACHE_TTL_MINUTES = 5;

    private function getCacheKey(int $branchId): string
    {
        return sprintf('branch_categories:%d', $branchId);
    }

    public function invalidateBranch(int $branchId): void
    {
        try {
            Cache::forget($this->getCacheKey($branchId));
        } catch (Throwable $exception) {
            // Continue without cache invalidation when Redis is unavailable.
        }
    }

    private function queryCategories(int $branchId): Collection
    {
        return Category::query()
            ->select('categories.id', 'categories.category_name', 'categories.description')
            ->selectRaw('COUNT(branch_products.id) as product_count')
            ->join('branch_products', 'branch_products.category_id', '=', 'categories.id')
            ->where('branch_products.branch_id', $branchId)
            ->groupBy('categories.id', 'categories.category_name', 'categories.description')
            ->orderBy('categories.category_name')
            ->get();
    }

    public function handle(int $branchId, bool $forceRefresh = false): Collection
    {
        try {
            if ($forceRefresh) {
                $this->invalidateBranch($branchId);
            }

            return Cache::remember($this->getCacheKey($branchId), now()->addMinutes(self::CACHE_TTL_MINUTES), function () use ($branchId) {
                return $this->queryCategories($branchId);
            });
        } catch (Throwable $exception) {
            return $this->queryCategories($branchId);
        }
    }
}
