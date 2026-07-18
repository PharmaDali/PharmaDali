<?php

namespace App\Services;

use App\Repositories\AnalyticsRepository;
use Carbon\Carbon;

class AnalyticsService
{
    public function __construct(protected AnalyticsRepository $repository)
    {
    }

    /**
     * Get Sales Analytics.
     */
    public function getSales(int $pharmacyId, string $timeframe, ?string $startDate = null, ?string $endDate = null): array
    {
        // Default to past 1 year if not provided
        $end = $endDate ? Carbon::parse($endDate) : Carbon::now();
        $start = $startDate ? Carbon::parse($startDate) : $end->copy()->subYear();

        $timeseries = $this->repository->getSalesTimeseries($pharmacyId, $timeframe, $start->toDateString(), $end->toDateString());

        return [
            'timeframe' => $timeframe,
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
            'data' => $timeseries,
        ];
    }

    /**
     * Get Demand Analytics (Top Products).
     * Now includes historical trend delta (period-over-period).
     */
    public function getDemand(int $pharmacyId, ?string $startDate = null, ?string $endDate = null, int $limit = 10): array
    {
        // Default to past 30 days if not provided
        $end = $endDate ? Carbon::parse($endDate) : Carbon::now();
        $start = $startDate ? Carbon::parse($startDate) : $end->copy()->subDays(30);

        // Fetch current period demand
        $currentDemand = $this->repository->getDemand($pharmacyId, $start->toDateString(), $end->toDateString(), $limit);

        // Calculate prior period dates
        $days = $start->diffInDays($end) + 1;
        $priorEnd = $start->copy()->subDay();
        $priorStart = $priorEnd->copy()->subDays($days - 1);

        // Fetch prior period demand (fetch more to ensure we cover the top products of current period)
        $priorDemand = $this->repository->getDemand($pharmacyId, $priorStart->toDateString(), $priorEnd->toDateString(), 100);

        // Map prior demand by product ID for quick lookup
        $priorMap = [];
        foreach ($priorDemand as $item) {
            $priorMap[$item->pharmacy_product_id] = $item;
        }

        // Calculate deltas
        foreach ($currentDemand as &$item) {
            $priorItem = $priorMap[$item->pharmacy_product_id] ?? null;

            $priorQty = $priorItem ? (int)$priorItem->total_quantity_sold : 0;
            $currentQty = (int)$item->total_quantity_sold;
            
            $priorRev = $priorItem ? (float)$priorItem->total_revenue : 0;
            $currentRev = (float)$item->total_revenue;

            // Quantity Delta %
            if ($priorQty > 0) {
                $item->quantity_delta = round((($currentQty - $priorQty) / $priorQty) * 100, 1);
            } else {
                $item->quantity_delta = $currentQty > 0 ? 100 : 0;
            }

            // Revenue Delta %
            if ($priorRev > 0) {
                $item->revenue_delta = round((($currentRev - $priorRev) / $priorRev) * 100, 1);
            } else {
                $item->revenue_delta = $currentRev > 0 ? 100 : 0;
            }
        }

        return [
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
            'prior_start_date' => $priorStart->toDateString(),
            'prior_end_date' => $priorEnd->toDateString(),
            'data' => $currentDemand,
        ];
    }
}
