<?php

namespace App\Services\Analytics;

use App\Repositories\AnalyticsRepository;
use Carbon\Carbon;

class GetSalesAnalytics
{
    public function __construct(protected AnalyticsRepository $repository)
    {
    }

    /**
     * Handle Sales Analytics calculation.
     */
    public function handle(int $pharmacyId, string $timeframe, ?string $startDate = null, ?string $endDate = null): array
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
}
