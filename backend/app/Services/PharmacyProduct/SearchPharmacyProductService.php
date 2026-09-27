<?php

namespace App\Services\PharmacyProduct;

use App\Models\PharmacyProduct;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Throwable;

class SearchPharmacyProductService
{
    private const DEFAULT_PER_PAGE = 20;
    private const CACHE_TTL = 300; // 5 minutes
    private const SUGGESTIONS_LIMIT = 8;

    /**
     * Search pharmacy products with Meilisearch (via Scout) or MySQL fallback.
     */
    public function handle(
        int $pharmacyId,
        string $query,
        int $perPage = self::DEFAULT_PER_PAGE,
        ?string $cursor = null,
    ) {
        $perPage = min($perPage, 50);
        $page = (is_numeric($cursor) && (int) $cursor > 0) ? (int) $cursor : 1;

        $cacheKey = "search_products_{$pharmacyId}_" . md5($query) . "_{$perPage}_{$page}_{$cursor}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($pharmacyId, $query, $perPage, $page, $cursor) {
            // 1. Try Meilisearch via Scout if driver is enabled
            if (config('scout.driver') === 'meilisearch') {
                try {
                    return PharmacyProduct::search($query)
                        ->where('pharmacy_id', $pharmacyId)
                        ->query(function ($builder) {
                            $builder->with([
                                'product:id,product_type,product_name,generic_name,brand_name,description,form,strength,size,is_prescribed,image_path',
                                'category:id,category_name,description',
                            ]);
                        })
                        ->paginate($perPage, 'page', $page);
                } catch (Throwable $e) {
                    report($e);
                }
            }

            // 2. MySQL Fallback: Check if exact LIKE match yields any results
            $exactCount = $cursor === null
                ? PharmacyProduct::where('pharmacy_id', $pharmacyId)
                    ->whereHas('product', function ($q) use ($query) {
                        $q->where('product_name', 'like', "%{$query}%")
                          ->orWhere('generic_name', 'like', "%{$query}%")
                          ->orWhere('brand_name', 'like', "%{$query}%")
                          ->orWhere('description', 'like', "%{$query}%");
                    })
                    ->count()
                : 1;

            $baseQuery = PharmacyProduct::query()
                ->with([
                    'product:id,product_type,product_name,generic_name,brand_name,description,form,strength,size,is_prescribed,image_path',
                    'category:id,category_name,description',
                ])
                ->where('pharmacy_id', $pharmacyId);

            if ($exactCount === 0) {
                // Token-based fallback: match any individual token from the query
                $tokens = array_values(array_filter(
                    explode(' ', preg_replace('/[^a-zA-Z0-9\s]/', '', $query))
                ));

                if (!empty($tokens)) {
                    $baseQuery->whereHas('product', function ($q) use ($tokens) {
                        $q->where(function ($inner) use ($tokens) {
                            foreach ($tokens as $token) {
                                $inner->orWhere('product_name', 'like', "%{$token}%")
                                      ->orWhere('generic_name', 'like', "%{$token}%")
                                      ->orWhere('brand_name', 'like', "%{$token}%");
                            }
                        });
                    });
                }
            } else {
                $baseQuery->whereHas('product', function ($q) use ($query) {
                    $q->where('product_name', 'like', "%{$query}%")
                      ->orWhere('generic_name', 'like', "%{$query}%")
                      ->orWhere('brand_name', 'like', "%{$query}%")
                      ->orWhere('description', 'like', "%{$query}%");
                });
            }

            return $baseQuery->orderBy('id')->cursorPaginate(perPage: $perPage, cursor: $cursor);
        });
    }

    /**
     * Return a lightweight list of product name suggestions for autocomplete.
     */
    public function suggestions(int $pharmacyId, string $query, int $limit = self::SUGGESTIONS_LIMIT): Collection
    {
        $cacheKey = "suggest_products_{$pharmacyId}_" . md5($query) . "_{$limit}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($pharmacyId, $query, $limit) {
            // 1. Try Meilisearch instant search-as-you-type with typo tolerance
            if (config('scout.driver') === 'meilisearch') {
                try {
                    $raw = PharmacyProduct::search($query)
                        ->where('pharmacy_id', $pharmacyId)
                        ->take($limit * 3)
                        ->raw();

                    $hits = $raw['hits'] ?? [];
                    if (!empty($hits)) {
                        return collect($hits)
                            ->map(function ($h) {
                                return trim($h['brand_name'] ?: ($h['product_name'] ?: ($h['generic_name'] ?? '')));
                            })
                            ->filter()
                            ->unique()
                            ->values()
                            ->take($limit);
                    }
                } catch (Throwable $e) {
                    report($e);
                }
            }

            // 2. MySQL Fallback
            return PharmacyProduct::query()
                ->join('products', 'pharmacy_products.product_id', '=', 'products.id')
                ->where('pharmacy_products.pharmacy_id', $pharmacyId)
                ->where(function ($q) use ($query) {
                    $q->where('products.product_name', 'like', "%{$query}%")
                      ->orWhere('products.generic_name', 'like', "%{$query}%")
                      ->orWhere('products.brand_name', 'like', "%{$query}%");
                })
                ->groupBy('pharmacy_products.product_id', 'products.product_name', 'products.generic_name', 'products.brand_name')
                ->orderByRaw("
                    CASE
                        WHEN products.product_name LIKE ? THEN 0
                        WHEN products.brand_name LIKE ? THEN 1
                        ELSE 2
                    END
                ", ["{$query}%", "{$query}%"])
                ->limit($limit)
                ->get(['products.product_name', 'products.generic_name', 'products.brand_name'])
                ->map(function ($p) {
                    return trim($p->brand_name ?: $p->product_name ?: $p->generic_name);
                })
                ->filter()
                ->unique()
                ->values();
        });
    }
}
