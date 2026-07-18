<?php

namespace App\Services;

use App\Algorithms\Apriori;
use App\Repositories\AnalyticsRepository;
use Carbon\Carbon;

class AprioriService
{
    public function __construct(protected AnalyticsRepository $repository)
    {
    }

    /**
     * Generate Market Basket Analysis rules using the Apriori algorithm.
     *
     * @param int $pharmacyId
     * @param int $monthsBack How many months of historical data to use
     * @param float $minSupport Minimum support threshold (0.0 to 1.0)
     * @param float $minConfidence Minimum confidence threshold (0.0 to 1.0)
     * @return array
     */
    public function generateFrequentlyBoughtTogether(
        int $pharmacyId, 
        int $monthsBack = 6, 
        float $minSupport = 0.05, 
        float $minConfidence = 0.2
    ): array {
        $startDate = Carbon::now()->subMonths($monthsBack)->toDateString();
        
        // Retrieve order item baskets and the product dictionary
        $data = $this->repository->getBasketsForApriori($pharmacyId, $startDate);
        $baskets = $data['baskets'];
        $productNames = $data['product_names'];

        // If not enough transactions, return empty
        if (count($baskets) < 5) {
            return [
                'total_transactions_analyzed' => count($baskets),
                'rules' => []
            ];
        }

        // Run Apriori
        $apriori = new Apriori($baskets, $minSupport, $minConfidence);
        $rawRules = $apriori->generateRules();

        // Format rules with human readable names
        $formattedRules = array_map(function ($rule) use ($productNames) {
            return [
                'antecedent_id' => $rule['antecedent'],
                'antecedent_name' => $productNames[$rule['antecedent']] ?? 'Unknown Product',
                'consequent_id' => $rule['consequent'],
                'consequent_name' => $productNames[$rule['consequent']] ?? 'Unknown Product',
                'support' => $rule['support'],
                'confidence' => $rule['confidence'],
                'formatted_rule' => sprintf(
                    "If a customer buys %s, they are %s likely to buy %s.",
                    $productNames[$rule['antecedent']] ?? 'Unknown Product',
                    round($rule['confidence'] * 100) . '%',
                    $productNames[$rule['consequent']] ?? 'Unknown Product'
                )
            ];
        }, $rawRules);

        // Limit to top 20 strongest rules
        $formattedRules = array_slice($formattedRules, 0, 20);

        return [
            'total_transactions_analyzed' => count($baskets),
            'rules' => $formattedRules
        ];
    }

    /**
     * Generate Category-level Market Basket Analysis rules using Apriori.
     */
    public function generateCategoryRules(
        int $pharmacyId, 
        int $monthsBack = 6, 
        float $minSupport = 0.05, 
        float $minConfidence = 0.2
    ): array {
        $startDate = Carbon::now()->subMonths($monthsBack)->toDateString();
        $data = $this->repository->getCategoryBasketsForApriori($pharmacyId, $startDate);
        $baskets = $data['baskets'];
        $categoryNames = $data['category_names'];

        if (count($baskets) < 5) {
            return [
                'total_transactions_analyzed' => count($baskets),
                'rules' => []
            ];
        }

        $apriori = new Apriori($baskets, $minSupport, $minConfidence);
        $rawRules = $apriori->generateRules();

        $formattedRules = array_map(function ($rule) use ($categoryNames) {
            return [
                'antecedent_category_id' => $rule['antecedent'],
                'antecedent_category_name' => $categoryNames[$rule['antecedent']] ?? 'Unknown Category',
                'consequent_category_id' => $rule['consequent'],
                'consequent_category_name' => $categoryNames[$rule['consequent']] ?? 'Unknown Category',
                'support' => $rule['support'],
                'confidence' => $rule['confidence'],
            ];
        }, $rawRules);

        return [
            'total_transactions_analyzed' => count($baskets),
            'rules' => array_slice($formattedRules, 0, 20)
        ];
    }
}
