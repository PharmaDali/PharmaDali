<?php

namespace App\Algorithms;

class Apriori
{
    /**
     * @var array
     */
    protected array $transactions;

    /**
     * @var float
     */
    protected float $minSupport;

    /**
     * @var float
     */
    protected float $minConfidence;

    public function __construct(array $transactions, float $minSupport = 0.05, float $minConfidence = 0.2)
    {
        $this->transactions = $transactions;
        $this->minSupport = $minSupport;
        $this->minConfidence = $minConfidence;
    }

    /**
     * Run the Apriori algorithm specifically to find 2-item association rules.
     * Returns rules in the format: A => B
     */
    public function generateRules(): array
    {
        $totalTransactions = count($this->transactions);
        if ($totalTransactions === 0) {
            return [];
        }

        $minSupportCount = $totalTransactions * $this->minSupport;

        // Step 1: Count item frequencies (1-itemsets)
        $itemCounts = [];
        foreach ($this->transactions as $basket) {
            // Ensure unique items per basket for counting
            $basket = array_unique($basket);
            foreach ($basket as $item) {
                if (!isset($itemCounts[$item])) {
                    $itemCounts[$item] = 0;
                }
                $itemCounts[$item]++;
            }
        }

        // Step 2: Prune 1-itemsets below minSupport
        $frequent1Itemsets = [];
        foreach ($itemCounts as $item => $count) {
            if ($count >= $minSupportCount) {
                $frequent1Itemsets[$item] = $count;
            }
        }

        // Step 3: Count pair frequencies (2-itemsets)
        $pairCounts = [];
        foreach ($this->transactions as $basket) {
            $basket = array_unique($basket);
            $count = count($basket);
            // Only process items that are in frequent1Itemsets
            $frequentItemsInBasket = [];
            foreach ($basket as $item) {
                if (isset($frequent1Itemsets[$item])) {
                    $frequentItemsInBasket[] = $item;
                }
            }

            $countFrequent = count($frequentItemsInBasket);
            for ($i = 0; $i < $countFrequent; $i++) {
                for ($j = $i + 1; $j < $countFrequent; $j++) {
                    $itemA = $frequentItemsInBasket[$i];
                    $itemB = $frequentItemsInBasket[$j];

                    // Standardize pair ordering to count undirected pairs first
                    $pair = ($itemA < $itemB) ? "{$itemA}_{$itemB}" : "{$itemB}_{$itemA}";
                    if (!isset($pairCounts[$pair])) {
                        $pairCounts[$pair] = 0;
                    }
                    $pairCounts[$pair]++;
                }
            }
        }

        // Step 4: Generate Rules (A => B and B => A)
        $rules = [];
        foreach ($pairCounts as $pair => $pairCount) {
            if ($pairCount < $minSupportCount) {
                continue;
            }

            [$itemA, $itemB] = explode('_', $pair);

            $supportA = $frequent1Itemsets[$itemA];
            $supportB = $frequent1Itemsets[$itemB];

            $supportPercentage = $pairCount / $totalTransactions;

            // Confidence A => B
            $confidenceAB = $pairCount / $supportA;
            if ($confidenceAB >= $this->minConfidence) {
                $rules[] = [
                    'antecedent' => $itemA,
                    'consequent' => $itemB,
                    'support' => round($supportPercentage, 4),
                    'confidence' => round($confidenceAB, 4)
                ];
            }

            // Confidence B => A
            $confidenceBA = $pairCount / $supportB;
            if ($confidenceBA >= $this->minConfidence) {
                $rules[] = [
                    'antecedent' => $itemB,
                    'consequent' => $itemA,
                    'support' => round($supportPercentage, 4),
                    'confidence' => round($confidenceBA, 4)
                ];
            }
        }

        // Sort rules by confidence descending
        usort($rules, fn($a, $b) => $b['confidence'] <=> $a['confidence']);

        return $rules;
    }
}
