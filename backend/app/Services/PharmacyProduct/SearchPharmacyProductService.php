<?php

namespace App\Services\PharmacyProduct;

use App\Models\PharmacyProduct;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Support\Facades\Cache;

class SearchPharmacyProductService
{
    private const DEFAULT_PER_PAGE = 20;
    private const CACHE_TTL = 300; // 5 minutes

    /**
     * Search pharmacy products with caching.
     */
    public function handle(
        int $pharmacyId,
        string $query,
        int $perPage = self::DEFAULT_PER_PAGE,
        ?string $cursor = null,
    ): CursorPaginator {
        $perPage = min($perPage, 50);
        
        $cacheKey = "search_products_{$pharmacyId}_" . md5($query) . "_{$perPage}_{$cursor}";
        
        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($pharmacyId, $query, $perPage, $cursor) {
            return PharmacyProduct::query()
                ->with([
                    'product:id,product_type,product_name,generic_name,brand_name,description,form,strength,size,is_prescribed',
                    'category:id,category_name,description',
                ])
                ->where('pharmacy_id', $pharmacyId)
                ->whereHas('product', function ($q) use ($query) {
                    $q->where('product_name', 'like', "%{$query}%")
                      ->orWhere('generic_name', 'like', "%{$query}%")
                      ->orWhere('brand_name', 'like', "%{$query}%")
                      ->orWhere('description', 'like', "%{$query}%");
                })
                ->orderBy('id')
                ->cursorPaginate(
                    perPage: $perPage,
                    cursor: $cursor,
                );
        });
    }
}
