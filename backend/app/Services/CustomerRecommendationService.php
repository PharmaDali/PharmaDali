<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PharmacyProduct;
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
    public function getRecommendations(User $customer, int $pharmacyId, int $page = 1, int $perPage = 10): array
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

        if (!$lastOrder || $lastOrder->items->isEmpty()) {
            $heroTitle = 'Stay Healthy!';
            $heroSubtitle = 'Stock up on our recommended Vitamins & Healthcare Essentials.';
            $allRecommendedIds = $this->getVitaminProducts($pharmacyId)->pluck('id')->toArray();
        } else {
            // HAS HISTORY: Run Apriori & Hybrid logic
            $allRecommendedIds = $this->getRecommendedProductIds($customer, $pharmacyId);

            // Extract primary purchased item & category details dynamically
            $firstItem = $lastOrder->items->first();
            $primaryProductName = $firstItem->product_name ?? $firstItem->pharmacyProduct->product->product_name ?? 'your recent purchase';
            $categoryName = strtolower($firstItem->pharmacyProduct->category->category_name ?? '');

            $catLower = strtolower($categoryName);
            $prodLower = strtolower($primaryProductName);

            if (str_contains($catLower, 'milk') || str_contains($catLower, 'infant') || str_contains($catLower, 'diaper') || str_contains($catLower, 'baby')) {
                $heroTitle = "Baby & Child Care Essentials";
                $heroSubtitle = "Based on your purchase of {$primaryProductName}, here are recommended diapers, formulas, and baby care items";
            } elseif (str_contains($catLower, 'vitamin') || str_contains($catLower, 'supplement')) {
                $heroTitle = "Immunity & Daily Wellness";
                $heroSubtitle = "Since you recently bought {$primaryProductName}, check out these top vitamins and daily health boosters";
            } elseif (str_contains($catLower, 'personal') || str_contains($catLower, 'hygiene') || str_contains($catLower, 'skincare') || str_contains($catLower, 'soap') || str_contains($catLower, 'shampoo') || str_contains($catLower, 'cosmetics')) {
                $heroTitle = "Personal Care & Hygiene Essentials";
                $heroSubtitle = "Complement your purchase of {$primaryProductName} with these daily personal care and grooming items";
            } elseif (str_contains($catLower, 'first aid') || str_contains($catLower, 'wound') || str_contains($catLower, 'bandage') || str_contains($catLower, 'device') || str_contains($catLower, 'equipment')) {
                $heroTitle = "First Aid & Medical Supplies";
                $heroSubtitle = "Since you bought {$primaryProductName}, keep your home prepared with these essential medical supplies";
            } elseif (str_contains($catLower, 'generic') || str_contains($catLower, 'branded') || str_contains($catLower, 'rx') || str_contains($catLower, 'medicine') || str_contains($prodLower, 'biogesic') || str_contains($prodLower, 'paracetamol')) {
                $heroTitle = "Health & Recovery Recommendations";
                $heroSubtitle = "Since you recently bought {$primaryProductName}, check out these health essentials and recovery boosters";
            } else {
                $heroTitle = "Recommended for You";
                $heroSubtitle = "Based on your recent purchase of {$primaryProductName}, here are complementary items you might like";
            }
        }

        if (empty($allRecommendedIds)) {
            $allRecommendedIds = $this->getVitaminProducts($pharmacyId)->pluck('id')->toArray();
        }

        // Slice recommended IDs for current page
        $validIds = array_values(array_map('intval', $allRecommendedIds));
        $pageIds = array_slice($validIds, $offset, $perPage);

        $items = collect();
        if (!empty($pageIds)) {
            $idsString = implode(',', $pageIds);
            $items = PharmacyProduct::with(['product', 'category'])
                ->where('pharmacy_id', $pharmacyId)
                ->whereIn('id', $pageIds)
                ->where('stock', '>', 0)
                ->orderByRaw("FIELD(id, {$idsString})")
                ->get();
        }

        // If page recommendation items count is less than perPage, append general pharmacy products as fallbacks for infinite feed
        if ($items->count() < $perPage) {
            $needed = $perPage - $items->count();
            $existingIds = array_merge(array_slice($validIds, 0, $offset + count($pageIds)), $items->pluck('id')->toArray());
            
            $fallbacks = PharmacyProduct::with(['product', 'category'])
                ->where('pharmacy_id', $pharmacyId)
                ->whereNotIn('id', array_unique($existingIds))
                ->where('stock', '>', 0)
                ->orderBy('id')
                ->limit($needed)
                ->get();

            $items = $items->concat($fallbacks);
        }

        // Check if there are more items after this page
        $totalPharmacyProducts = PharmacyProduct::where('pharmacy_id', $pharmacyId)->where('stock', '>', 0)->count();
        $totalFetchedSoFar = $offset + $items->count();
        $hasMore = $totalFetchedSoFar < $totalPharmacyProducts || ($offset + $perPage) < count($validIds);

        return [
            'has_history' => isset($lastOrder) && $lastOrder && !$lastOrder->items->isEmpty(),
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
    public function getRecommendedProductIds(User $customer, int $pharmacyId): array
    {
        $customerRecord = $customer->customer ?? Customer::where('user_id', $customer->id)->first();
        $targetCustomerId = $customerRecord ? $customerRecord->id : $customer->id;

        $lastOrder = Order::with(['items.pharmacyProduct.product', 'items.pharmacyProduct.category'])
            ->where('customer_id', $targetCustomerId)
            ->where('pharmacy_id', $pharmacyId)
            ->where('status', 'completed')
            ->latest('completed_at')
            ->first();

        if (!$lastOrder) {
            return $this->getVitaminProducts($pharmacyId)->pluck('id')->toArray();
        }

        $poolA_ProductApriori = [];
        $poolB_CategoryApriori = [];
        $poolC_NonMedicineBrands = [];
        $poolD_Vitamins = $this->getVitaminProducts($pharmacyId)->pluck('id')->toArray();

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
            $poolB_CategoryApriori = PharmacyProduct::where('pharmacy_id', $pharmacyId)
                ->whereIn('category_id', array_unique($consequentCategoryIds))
                ->whereNotIn('id', $recentProductIds)
                ->where('stock', '>', 0)
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
            $poolC_NonMedicineBrands = PharmacyProduct::where('pharmacy_id', $pharmacyId)
                ->whereIn('category_id', $nonMedicineCategoryIds)
                ->whereNotIn('id', $recentProductIds)
                ->where('stock', '>', 0)
                ->inRandomOrder()
                ->limit(15)
                ->pluck('id')
                ->map('intval')
                ->toArray();
        }

        // --- BLEND / INTERLEAVE POOLS ROUND-ROBIN ---
        $blendedIds = [];
        $maxLen = max(count($poolA_ProductApriori), count($poolB_CategoryApriori), count($poolC_NonMedicineBrands), count($poolD_Vitamins));

        for ($i = 0; $i < $maxLen; $i++) {
            if (isset($poolA_ProductApriori[$i])) $blendedIds[] = $poolA_ProductApriori[$i];
            if (isset($poolB_CategoryApriori[$i])) $blendedIds[] = $poolB_CategoryApriori[$i];
            if (isset($poolC_NonMedicineBrands[$i])) $blendedIds[] = $poolC_NonMedicineBrands[$i];
            if (isset($poolD_Vitamins[$i])) $blendedIds[] = $poolD_Vitamins[$i];
        }

        $finalIds = array_values(array_unique(array_filter($blendedIds)));

        if (empty($finalIds)) {
            return $poolD_Vitamins;
        }

        return $finalIds;
    }

    /**
     * Fetch vitamin/supplement products from a pharmacy.
     */
    private function getVitaminProducts(int $pharmacyId): \Illuminate\Support\Collection
    {
        $vitamins = PharmacyProduct::with(['product', 'category'])
            ->where('pharmacy_id', $pharmacyId)
            ->whereHas('category', function ($query) {
                $query->where('category_name', 'like', '%Vitamin%')
                      ->orWhere('category_name', 'like', '%Supplement%');
            })
            ->where('stock', '>', 0)
            ->inRandomOrder()
            ->limit(20)
            ->get();

        if ($vitamins->isEmpty()) {
            $vitamins = PharmacyProduct::with(['product', 'category'])
                ->where('pharmacy_id', $pharmacyId)
                ->where('stock', '>', 0)
                ->limit(20)
                ->get();
        }

        return $vitamins;
    }
}
