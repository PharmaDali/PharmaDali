<?php

namespace App\Algorithms;

class RestockPredictor
{
    private const DEFAULT_LEAD_TIME_DAYS = 3;
    private const ADS_WINDOW_DAYS = 30;
    private const ADS_SHORT_WINDOW_DAYS = 7;

    /**
     * Run the restock prediction algorithm.
     *
     * Accepts a flat array of product snapshots (pre-fetched by the repository),
     * and returns a ranked list of products that need restocking.
     *
     * Each product snapshot must contain:
     *   - id, name, brand, category, quantity (current stock), selling_price
     *   - total_sold_30d: sum of units sold in the last 30 days (0 if never sold)
     *   - total_sold_7d: sum of units sold in the last 7 days (0 if never sold)
     *
     * @param  array $products   Raw product snapshot data from the repository
     * @param  int   $limit      Max number of results to return
     * @return array             Ranked restock predictions
     */
    public function predict(array $products, int $limit = 5, int $leadTimeDays = self::DEFAULT_LEAD_TIME_DAYS, int $forecastHorizonDays = 7): array
    {
        $predictions = [];

        foreach ($products as $product) {
            $currentStock  = (int) $product['quantity'];
            $totalSold30d  = (int) ($product['total_sold_30d'] ?? 0);
            $totalSold7d   = (int) ($product['total_sold_7d'] ?? 0);

            // Average Daily Sales (ADS) - 30 days and 7 days
            $ads30d = $totalSold30d / self::ADS_WINDOW_DAYS;
            $ads7d  = $totalSold7d / self::ADS_SHORT_WINDOW_DAYS;

            // Weighted Average Daily Sales (60% weight to recent 7 days, 40% to 30 days)
            $ads = ($ads7d * 0.6) + ($ads30d * 0.4);

            // Dynamic Safety Stock: 50% of Lead Time Demand, absolute minimum 2
            $safetyStock = max(2, ($ads * $leadTimeDays) * 0.5);

            // Dynamic Reorder Point (ROP)
            $rop = ($ads * $leadTimeDays) + $safetyStock;

            // Days of Stock (DOS) — how many days until stockout
            $daysOfStock = ($ads > 0) ? ($currentStock / $ads) : 999;

            // Dynamic Filter — flag products at or below their dynamic ROP, OR if stock will run out in <= forecast Horizon days
            if ($currentStock > $rop && $daysOfStock > $forecastHorizonDays) {
                continue;
            }

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
                'batches'          => $product['batches'] ?? [],
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
