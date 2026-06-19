<?php

namespace App\Services\PharmacyProduct;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Throwable;

class ShowPharmacyCategoriesService
{
    private const CACHE_TTL_MINUTES = 5;

    private function getCacheKey(int $pharmacyId): string
    {
        return sprintf('pharmacy_categories:%d', $pharmacyId);
    }

    public function invalidatePharmacy(int $pharmacyId): void
    {
        try {
            Cache::forget($this->getCacheKey($pharmacyId));
        } catch (Throwable $exception) {
            // Continue without cache invalidation when Redis is unavailable.
        }
    }

    private function queryCategories(int $pharmacyId): Collection
    {
        return Category::query()
            ->select('categories.id', 'categories.category_name', 'categories.description')
            ->selectRaw('COUNT(pharmacy_products.id) as product_count')
            ->join('pharmacy_products', 'pharmacy_products.category_id', '=', 'categories.id')
            ->where('pharmacy_products.pharmacy_id', $pharmacyId)
            ->groupBy('categories.id', 'categories.category_name', 'categories.description')
            ->orderBy('categories.category_name')
            ->get();
    }

    public function handle(int $pharmacyId, bool $forceRefresh = false): Collection
    {
        try {
            if ($forceRefresh) {
                $this->invalidatePharmacy($pharmacyId);
            }

            return Cache::remember($this->getCacheKey($pharmacyId), now()->addMinutes(self::CACHE_TTL_MINUTES), function () use ($pharmacyId) {
                return $this->queryCategories($pharmacyId);
            });
        } catch (Throwable $exception) {
            return $this->queryCategories($pharmacyId);
        }
    }
}
