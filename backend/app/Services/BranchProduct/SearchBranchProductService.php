<?php

namespace App\Services\BranchProduct;

use App\Models\BranchProduct;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Support\Facades\Cache;

class SearchBranchProductService
{
    private const DEFAULT_PER_PAGE = 20;
    private const CACHE_TTL = 300; // 5 minutes

    /**
     * Search branch products with caching.
     */
    public function handle(
        int $branchId,
        string $query,
        int $perPage = self::DEFAULT_PER_PAGE,
        ?string $cursor = null,
    ): CursorPaginator {
        $perPage = min($perPage, 50);
        
        $cacheKey = "search_products_{$branchId}_" . md5($query) . "_{$perPage}_{$cursor}";
        
        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($branchId, $query, $perPage, $cursor) {
            return BranchProduct::query()
                ->with([
                    'product:id,product_type,product_name,generic_name,brand_name,description,form,strength,size,is_prescribed',
                    'category:id,category_name,description',
                ])
                ->where('branch_id', $branchId)
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
