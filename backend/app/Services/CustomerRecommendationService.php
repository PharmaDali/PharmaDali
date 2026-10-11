<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PharmacyProduct;
use App\Models\Category;
use App\Models\User;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Jobs\GenerateAprioriRules;

class CustomerRecommendationService
{
    public function __construct(
        protected AprioriService $aprioriService
    ) {}

    /**
     * Get dynamic recommendations and hero text for a customer.
     */
    public function getRecommendations(User $customer, int $pharmacyId, int $page = 1, int $perPage = 10, array $recentSearches = []): array
    {
        $perPage = max(1, min($perPage, 50));
        $page = max(1, $page);
        $offset = ($page - 1) * $perPage;

        $customerRecord = $customer->customer ?? Customer::where('user_id', $customer->id)->first();
        $targetCustomerId = $customerRecord ? $customerRecord->id : $customer->id;

        // 1. Check if customer has any completed orders in this pharmacy
        $lastOrder = Order::with(['items.pharmacyProduct.product', 'items.pharmacyProduct.category'])
            ->where('customer_id', $targetCustomerId)
            ->where('pharmacy_id', $pharmacyId)
            ->where('status', 'completed')
            ->latest('completed_at')
            ->first();

        // 2. Check search intent matches
        $searchData = $this->resolveSearchRecommendations($recentSearches, $pharmacyId);
        $matchedSearchTerm = $searchData['matched_term'];
        $hasSearchIntent = !empty($searchData['product_ids']) && $matchedSearchTerm !== null;
        $hasOrderHistory = $lastOrder && !$lastOrder->items->isEmpty();

        $allRecommendedIds = $this->getRecommendedProductIds($customer, $pharmacyId, $recentSearches);

        if ($hasOrderHistory) {
            // Extract primary purchased item & category details dynamically from the database
            $firstItem = $lastOrder->items->first(function ($item) {
                return $item->pharmacyProduct?->category || $item->pharmacyProduct?->category_id;
            }) ?? $lastOrder->items->first();

            $primaryProductName = $firstItem->product_name ?? $firstItem->pharmacyProduct?->product?->product_name ?? 'your recent purchase';
            $category = $firstItem->pharmacyProduct?->category
                ?? ($firstItem->pharmacyProduct?->category_id ? Category::find($firstItem->pharmacyProduct->category_id) : null);

            if ($category && !empty($category->hero_title)) {
                $heroTitle = $category->hero_title;
                $heroSubtitle = $category->formatHeroSubtitle($primaryProductName);
            } else {
                $heroTitle = "Recommended for You";
                $heroSubtitle = "Based on your recent purchase of {$primaryProductName}, here are complementary items you might like";
            }
        } elseif ($hasSearchIntent) {
            $formattedTerm = ucwords($matchedSearchTerm);
            $heroTitle = "Looking for {$formattedTerm}?";
            $heroSubtitle = "Based on your recent search for {$matchedSearchTerm}, here are items available at your selected branch.";
        } else {
            $heroTitle = 'Stay Healthy!';
            $heroSubtitle = 'Stock up on our recommended Vitamins & Healthcare Essentials.';
        }

        if (empty($allRecommendedIds)) {
            $allRecommendedIds = $this->getVitaminProducts($pharmacyId)->pluck('id')->toArray();
        }

        // Slice recommended IDs for current page
        $validIds = array_values(array_map('intval', $allRecommendedIds));
        $totalRecommendations = count($validIds);

        // If offset already exceeds recommendations on subsequent pages, stop
        if ($offset >= $totalRecommendations && $page > 1) {
            return [
                'has_history' => $hasOrderHistory || $hasSearchIntent,
                'hero_title' => $heroTitle,
                'hero_subtitle' => $heroSubtitle,
                'recommendations' => collect(),
                'page' => $page,
                'per_page' => $perPage,
                'has_more' => false,
            ];
        }

        $pageIds = array_slice($validIds, $offset, $perPage);

        $items = collect();
        if (!empty($pageIds)) {
            $idsString = implode(',', $pageIds);
            $itemsQuery = PharmacyProduct::with(['product', 'category'])
                ->where('pharmacy_id', $pharmacyId)
                ->whereIn('id', $pageIds)
                ->where('stock', '>', 0);
            $this->applyBranchCategoryFilter($itemsQuery, $pharmacyId);

            if (DB::getDriverName() === 'mysql') {
                $items = $itemsQuery->orderByRaw("FIELD(id, {$idsString})")->get();
            } else {
                $items = $itemsQuery->get()->sortBy(function ($model) use ($pageIds) {
                    return array_search($model->id, $pageIds);
                })->values();
            }
        }

        // Only on initial page load, if recommended count is very low (e.g. < 4), supplement with active products
        if ($page === 1 && $items->count() < 4) {
            $needed = 4 - $items->count();
            $existingIds = array_merge($validIds, $items->pluck('id')->toArray());

            $fallbacksQuery = PharmacyProduct::with(['product', 'category'])
                ->where('pharmacy_id', $pharmacyId)
                ->whereNotIn('id', array_unique($existingIds))
                ->where('stock', '>', 0);
            $this->applyBranchCategoryFilter($fallbacksQuery, $pharmacyId);
            $fallbacks = $fallbacksQuery->orderBy('id')->limit($needed)->get();

            $items = $items->concat($fallbacks);
        }

        // Determine if more recommendations exist
        $hasMore = ($offset + $perPage) < $totalRecommendations;

        return [
            'has_history' => $hasOrderHistory || $hasSearchIntent,
            'hero_title' => $heroTitle,
            'hero_subtitle' => $heroSubtitle,
            'recommendations' => $items->values(),
            'page' => $page,
            'per_page' => $perPage,
            'has_more' => $hasMore,
        ];
    }


    /**
     * Get Apriori-recommended PharmacyProduct IDs for a customer using a Blended Hybrid strategy.
     */
    public function getRecommendedProductIds(User $customer, int $pharmacyId, array $recentSearches = []): array
    {
        $customerRecord = $customer->customer ?? Customer::where('user_id', $customer->id)->first();
        $targetCustomerId = $customerRecord ? $customerRecord->id : $customer->id;

        $lastOrder = Order::with(['items.pharmacyProduct.product', 'items.pharmacyProduct.category'])
            ->where('customer_id', $targetCustomerId)
            ->where('pharmacy_id', $pharmacyId)
            ->where('status', 'completed')
            ->latest('completed_at')
            ->first();

        // --- POOL S: Recent Search Intent and Search Apriori ---
        $searchData = $this->resolveSearchRecommendations($recentSearches, $pharmacyId);
        $poolS_SearchIntent = $searchData['product_ids'];

        $poolA_ProductApriori = [];
        $poolB_CategoryApriori = [];
        $poolC_NonMedicineBrands = [];
        $poolD_Vitamins = $this->getVitaminProducts($pharmacyId)->pluck('id')->toArray();

        if ($lastOrder && !$lastOrder->items->isEmpty()) {
            $recentProductIds = $lastOrder->items->pluck('pharmacy_product_id')->toArray();

            // --- POOL A: Product-Level Apriori Matching ---
            $productRulesKey = "apriori_rules_pharmacy_{$pharmacyId}";
            $productRulesData = Cache::get($productRulesKey);

            if ($productRulesData === null) {
                GenerateAprioriRules::dispatch($pharmacyId);
            }

            $productRules = $productRulesData['rules'] ?? [];
            foreach ($productRules as $rule) {
                if (in_array($rule['antecedent_id'], $recentProductIds)) {
                    $poolA_ProductApriori[] = (int) $rule['consequent_id'];
                }
            }

            // --- POOL B: Category-Level Apriori Matching ---
            $recentCategoryIds = $lastOrder->items->map(function ($item) {
                return $item->pharmacyProduct->category_id ?? null;
            })->filter()->unique()->toArray();

            $categoryRulesKey = "apriori_category_rules_pharmacy_{$pharmacyId}";
            $categoryRulesData = Cache::get($categoryRulesKey);

            if ($categoryRulesData === null) {
                GenerateAprioriRules::dispatch($pharmacyId);
            }

            $categoryRules = $categoryRulesData['rules'] ?? [];
            $consequentCategoryIds = [];

            foreach ($categoryRules as $cRule) {
                if (in_array($cRule['antecedent_category_id'], $recentCategoryIds)) {
                    $consequentCategoryIds[] = (int) $cRule['consequent_category_id'];
                }
            }

            if (!empty($consequentCategoryIds)) {
                $poolBQuery = PharmacyProduct::where('pharmacy_id', $pharmacyId)
                    ->whereIn('category_id', array_unique($consequentCategoryIds))
                    ->whereNotIn('id', $recentProductIds)
                    ->where('stock', '>', 0);
                $this->applyBranchCategoryFilter($poolBQuery, $pharmacyId);
                $poolB_CategoryApriori = $poolBQuery
                    ->limit(15)
                    ->pluck('id')
                    ->map('intval')
                    ->toArray();
            }

            // --- POOL C: Non-Medicine Cross-Brand Discoveries ---
            // Suggest alternative brands for non-medicine categories (Milk, Diapers, Hygiene, Drinks, Cosmetics, Infant)
            $nonMedicineCategoryIds = $lastOrder->items->filter(function ($item) {
                $catName = strtolower($item->pharmacyProduct->category->category_name ?? '');
                $isPrescribed = (bool) ($item->pharmacyProduct->product->is_prescribed ?? false);
                $isMedicineCategory = str_contains($catName, 'generic') || str_contains($catName, 'rx') || str_contains($catName, 'medicine');
                return !$isPrescribed && !$isMedicineCategory;
            })->map(function ($item) {
                return $item->pharmacyProduct->category_id ?? null;
            })->filter()->unique()->toArray();

            if (!empty($nonMedicineCategoryIds)) {
                $poolCQuery = PharmacyProduct::where('pharmacy_id', $pharmacyId)
                    ->whereIn('category_id', $nonMedicineCategoryIds)
                    ->whereNotIn('id', $recentProductIds)
                    ->where('stock', '>', 0);
                $this->applyBranchCategoryFilter($poolCQuery, $pharmacyId);
                $poolC_NonMedicineBrands = $poolCQuery
                    ->inRandomOrder()
                    ->limit(15)
                    ->pluck('id')
                    ->map('intval')
                    ->toArray();
            }
        }

        // --- BLEND / INTERLEAVE POOLS ROUND-ROBIN ---
        $blendedIds = [];
        $maxLen = max(
            count($poolS_SearchIntent),
            count($poolA_ProductApriori),
            count($poolB_CategoryApriori),
            count($poolC_NonMedicineBrands),
            count($poolD_Vitamins)
        );

        $hasOrderHistory = $lastOrder && !$lastOrder->items->isEmpty();

        for ($i = 0; $i < $maxLen; $i++) {
            if ($hasOrderHistory) {
                if (isset($poolA_ProductApriori[$i])) $blendedIds[] = $poolA_ProductApriori[$i];
                if (isset($poolB_CategoryApriori[$i])) $blendedIds[] = $poolB_CategoryApriori[$i];
                if (isset($poolS_SearchIntent[$i])) $blendedIds[] = $poolS_SearchIntent[$i];
                if (isset($poolC_NonMedicineBrands[$i])) $blendedIds[] = $poolC_NonMedicineBrands[$i];
                if (isset($poolD_Vitamins[$i])) $blendedIds[] = $poolD_Vitamins[$i];
            } else {
                if (isset($poolS_SearchIntent[$i])) $blendedIds[] = $poolS_SearchIntent[$i];
                if (isset($poolD_Vitamins[$i])) $blendedIds[] = $poolD_Vitamins[$i];
            }
        }

        $finalIds = array_values(array_unique(array_filter($blendedIds)));

        if (empty($finalIds)) {
            return $poolD_Vitamins;
        }

        return $finalIds;
    }

    /**
     * Resolve recommended PharmacyProduct IDs and primary matched search term from recent searches.
     */
    protected function resolveSearchRecommendations(array $recentSearches, int $pharmacyId): array
    {
        $sanitizedSearches = array_values(array_filter(array_map('trim', $recentSearches), function ($term) {
            return is_string($term) && $term !== '';
        }));

        if (empty($sanitizedSearches)) {
            return [
                'product_ids' => [],
                'matched_term' => null,
            ];
        }

        $directProductIds = [];
        $firstMatchedTerm = null;

        foreach ($sanitizedSearches as $term) {
            $searchQuery = PharmacyProduct::where('pharmacy_id', $pharmacyId)
                ->where('stock', '>', 0)
                ->where(function ($q) use ($term) {
                    $q->whereHas('product', function ($pq) use ($term) {
                        $pq->where('product_name', 'like', "%{$term}%")
                            ->orWhere('generic_name', 'like', "%{$term}%")
                            ->orWhere('brand_name', 'like', "%{$term}%");
                    })->orWhereHas('category', function ($cq) use ($term) {
                        $cq->where('category_name', 'like', "%{$term}%");
                    });
                });

            $this->applyBranchCategoryFilter($searchQuery, $pharmacyId);
            $matchedIds = $searchQuery->limit(10)->pluck('id')->map('intval')->toArray();

            if (!empty($matchedIds)) {
                if ($firstMatchedTerm === null) {
                    $firstMatchedTerm = $term;
                }
                foreach ($matchedIds as $id) {
                    $directProductIds[] = $id;
                }
            }
        }

        $directProductIds = array_values(array_unique($directProductIds));

        // Discover Apriori cross-sell recommendations for search matched products
        $searchAprioriIds = [];
        if (!empty($directProductIds)) {
            $productRulesKey = "apriori_rules_pharmacy_{$pharmacyId}";
            $productRulesData = Cache::get($productRulesKey);

            if ($productRulesData === null) {
                GenerateAprioriRules::dispatch($pharmacyId);
            }

            $productRules = $productRulesData['rules'] ?? [];
            $rawAprioriIds = [];
            foreach ($productRules as $rule) {
                if (in_array($rule['antecedent_id'], $directProductIds)) {
                    $rawAprioriIds[] = (int) $rule['consequent_id'];
                }
            }

            if (!empty($rawAprioriIds)) {
                $aprioriQuery = PharmacyProduct::where('pharmacy_id', $pharmacyId)
                    ->whereIn('id', array_unique($rawAprioriIds))
                    ->whereNotIn('id', $directProductIds)
                    ->where('stock', '>', 0);
                $this->applyBranchCategoryFilter($aprioriQuery, $pharmacyId);
                $searchAprioriIds = $aprioriQuery->limit(10)->pluck('id')->map('intval')->toArray();
            }
        }

        $poolS = array_values(array_unique(array_merge($directProductIds, $searchAprioriIds)));
        $poolS = array_slice($poolS, 0, 15);

        return [
            'product_ids' => $poolS,
            'matched_term' => $firstMatchedTerm,
        ];
    }

    /**
     * Fetch vitamin/supplement products from a pharmacy.
     */
    private function getVitaminProducts(int $pharmacyId): \Illuminate\Support\Collection
    {
        $vitaminsQuery = PharmacyProduct::with(['product', 'category'])
            ->where('pharmacy_id', $pharmacyId)
            ->whereHas('category', function ($query) {
                $query->where('category_name', 'like', '%Vitamin%')
                      ->orWhere('category_name', 'like', '%Supplement%');
            })
            ->where('stock', '>', 0);
        $this->applyBranchCategoryFilter($vitaminsQuery, $pharmacyId);
        $vitamins = $vitaminsQuery->inRandomOrder()->limit(20)->get();

        if ($vitamins->isEmpty()) {
            $fallbackQuery = PharmacyProduct::with(['product', 'category'])
                ->where('pharmacy_id', $pharmacyId)
                ->where('stock', '>', 0);
            $this->applyBranchCategoryFilter($fallbackQuery, $pharmacyId);
            $vitamins = $fallbackQuery->limit(20)->get();
        }

        return $vitamins;
    }

    /**
     * Apply filter to exclude products belonging to disabled categories for this pharmacy branch.
     */
    private function applyBranchCategoryFilter($query, int $pharmacyId)
    {
        return $query->where(function ($productQuery) use ($pharmacyId) {
            $productQuery->whereNull('category_id')
                ->orWhereHas('category', function ($categoryQuery) use ($pharmacyId) {
                    $categoryQuery->where('categories.is_enabled', true)
                        ->whereNotExists(function ($sub) use ($pharmacyId) {
                            $sub->selectRaw(1)
                                ->from('pharmacy_categories')
                                ->whereColumn('pharmacy_categories.category_id', 'categories.id')
                                ->where('pharmacy_categories.pharmacy_id', $pharmacyId)
                                ->where('pharmacy_categories.is_enabled', false);
                        });
                });
        });
    }
}
