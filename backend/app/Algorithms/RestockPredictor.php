<?php

namespace App\Algorithms;

class RestockPredictor
{
    private const DEFAULT_LEAD_TIME_DAYS = 3;
    private const MIN_SAFETY_STOCK = 10;
    private const ADS_WINDOW_DAYS = 30;

    /**
     * Run the restock prediction algorithm.
     *
     * Accepts a flat array of product snapshots (pre-fetched by the repository),
     * and returns a ranked list of products that need restocking.
     *
     * Each product snapshot must contain:
     *   - id, name, brand, category, quantity (current stock), selling_price
     *   - total_sold_30d: sum of units sold in the last 30 days (0 if never sold)
     *
     * @param  array $products   Raw product snapshot data from the repository
     * @param  int   $limit      Max number of results to return
     * @return array             Ranked restock predictions
     */
    public function predict(array $products, int $limit = 5): array
    {
        $predictions = [];

        foreach ($products as $product) {
            $currentStock  = (int) $product['quantity'];
            $totalSold     = (int) ($product['total_sold_30d'] ?? 0);

            // Average Daily Sales (ADS)
            $ads = $totalSold / self::ADS_WINDOW_DAYS;

            // Dynamic Reorder Point (ROP)
            $rop = ($ads > 0)
                ? ($ads * self::DEFAULT_LEAD_TIME_DAYS) + self::MIN_SAFETY_STOCK
                : self::MIN_SAFETY_STOCK;

            // Filter — only flag products at or below their ROP
            if ($currentStock > $rop) {
                continue;
            }

            // Days of Stock (DOS) — how many days until stockout
            $daysOfStock = ($ads > 0) ? ($currentStock / $ads) : 999;

            // Weeks left estimate
            $weeksLeft = ($ads > 0) ? ($currentStock / ($ads * 7)) : 99;

            // Sales velocity label based on ADS
            $velocity = $this->resolveVelocityLabel($ads);

            $predictions[] = [
                'id'               => $product['id'],
                'name'             => $product['name'],
                'brand'            => $product['brand'],
                'category'         => $product['category'],
                'quantity'         => $currentStock,
                'reorderPoint'     => round($rop, 1),
                'averageDailySales'=> round($ads, 2),
                'daysOfStock'      => round($daysOfStock),
                'weeksLeft'        => $weeksLeft <= 1 ? 'less than 1' : (string) round($weeksLeft),
                'velocity'         => $velocity,
                'sellingPrice'     => $product['selling_price'],
            ];
        }

        // Sort by Days of Stock ascending (most urgent first), breaking ties by lowest quantity
        usort($predictions, function ($a, $b) {
            if ($a['daysOfStock'] === $b['daysOfStock']) {
                return $a['quantity'] <=> $b['quantity'];
            }
            return $a['daysOfStock'] <=> $b['daysOfStock'];
        });

        return array_slice($predictions, 0, $limit);
    }

    /**
     * Resolve a human-readable velocity label from Average Daily Sales.
     *
     * >= 3 units/day -> Fast
     * >= 1 unit/day  -> Medium
     * <  1 unit/day  -> Slow
     */
    private function resolveVelocityLabel(float $ads): string
    {
        if ($ads >= 3) return 'Fast';
        if ($ads >= 1) return 'Medium';
        return 'Slow';
    }
}
