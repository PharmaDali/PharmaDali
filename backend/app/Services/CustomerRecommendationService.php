<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PharmacyProduct;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class CustomerRecommendationService
{
    public function __construct(
        protected AprioriService $aprioriService
    ) {}

    /**
     * Get dynamic recommendations and hero text for a customer.
     */
    public function getRecommendations(User $customer, int $pharmacyId): array
    {
        // 1. Check if customer has any completed orders in this pharmacy
        $lastOrder = Order::with('items')
            ->where('customer_id', $customer->id)
            ->where('pharmacy_id', $pharmacyId)
            ->where('status', 'completed')
            ->latest('completed_at')
            ->first();

        if (!$lastOrder) {
            // FALLBACK: No history. Recommend Vitamins & Supplements.
            // PharmacyProduct has a direct category() BelongsTo, so we use that.
            $vitamins = $this->getVitaminProducts($pharmacyId);

            return [
                'has_history' => false,
                'hero_title' => 'Stay Healthy!',
                'hero_subtitle' => 'Stock up on our recommended Vitamins & Supplements.',
                'recommendations' => $vitamins,
            ];
        }

        // 2. HAS HISTORY: Run Apriori logic.

        // Cache the rules for this pharmacy for 24 hours to prevent performance bottleneck
        $cacheKey = "apriori_rules_pharmacy_{$pharmacyId}";
        $rulesData = Cache::remember($cacheKey, 60 * 60 * 24, function () use ($pharmacyId) {
            return $this->aprioriService->generateFrequentlyBoughtTogether($pharmacyId, 6, 0.05, 0.2);
        });

        $rules = $rulesData['rules'] ?? [];
        $recentProductIds = $lastOrder->items->pluck('pharmacy_product_id')->toArray();
        $recommendedProductIds = [];

        // Match recent items against rules
        foreach ($rules as $rule) {
            if (in_array($rule['antecedent_id'], $recentProductIds)) {
                $recommendedProductIds[] = $rule['consequent_id'];
            }
        }

        $recommendedProductIds = array_unique($recommendedProductIds);

        // If no matches found from Apriori, fallback to Vitamins
        if (empty($recommendedProductIds)) {
            $vitamins = $this->getVitaminProducts($pharmacyId);

            return [
                'has_history' => true,
                'hero_title' => 'Welcome Back!',
                'hero_subtitle' => 'Since you\'re back, check out our top Vitamins & Supplements.',
                'recommendations' => $vitamins,
            ];
        }

        // Fetch the matched products
        $recommendedProducts = PharmacyProduct::with(['product'])
            ->where('pharmacy_id', $pharmacyId)
            ->whereIn('id', $recommendedProductIds)
            ->where('stock', '>', 0)
            ->limit(5)
            ->get()
            ->map(fn($pp) => $this->formatProduct($pp));

        return [
            'has_history' => true,
            'hero_title' => 'Recommended for You',
            'hero_subtitle' => 'Based on your recent purchases, you might like these:',
            'recommendations' => $recommendedProducts,
        ];
    }

    /**
     * Fetch vitamin/supplement products from a pharmacy.
     * Uses PharmacyProduct's direct category() relationship.
     */
    private function getVitaminProducts(int $pharmacyId): \Illuminate\Support\Collection
    {
        return PharmacyProduct::with(['product', 'category'])
            ->where('pharmacy_id', $pharmacyId)
            ->whereHas('category', function ($query) {
                $query->where('name', 'like', '%Vitamin%')
                      ->orWhere('name', 'like', '%Supplement%');
            })
            ->where('stock', '>', 0)
            ->inRandomOrder()
            ->limit(5)
            ->get()
            ->map(fn($pp) => $this->formatProduct($pp));
    }

    /**
     * Format a PharmacyProduct for the API response.
     * Accepts both an Eloquent PharmacyProduct model and a plain stdClass
     * (the latter can happen when objects are deserialized from the cache).
     */
    private function formatProduct(mixed $pp): array
    {
        // Support both Eloquent models (->property) and stdClass from cache (->property)
        $product = $pp->product ?? null;
        return [
            'id'        => $pp->id,
            'name'      => $product?->product_name ?? 'Unknown',
            'price'     => $pp->selling_price,
            'image_url' => $product?->image_url ?? null,
        ];
    }
}
