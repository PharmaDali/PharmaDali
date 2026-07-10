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
     * Get Demand Analytics.
     */
    public function getDemand(int $pharmacyId, ?string $startDate = null, ?string $endDate = null, int $limit = 10): array
    {
        // Default to past 30 days if not provided
        $end = $endDate ? Carbon::parse($endDate) : Carbon::now();
        $start = $startDate ? Carbon::parse($startDate) : $end->copy()->subDays(30);

        $demand = $this->repository->getDemand($pharmacyId, $start->toDateString(), $end->toDateString(), $limit);

        return [
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
            'data' => $demand,
        ];
    }
}
