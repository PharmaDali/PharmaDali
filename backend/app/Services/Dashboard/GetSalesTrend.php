<?php

namespace App\Services\Dashboard;

use App\Services\Analytics\AnalyticsService;
use Carbon\Carbon;

class GetSalesTrend
{
    public function __construct(
        protected AnalyticsService $analyticsService
    ) {}

    /**
     * Compute sales trend charts data.
     */
    public function handle(int $pharmacyId, ?string $range = 'Weekly'): array
    {
        $normalizedRange = ucfirst(strtolower($range ?? 'Weekly'));

        if ($normalizedRange === 'Monthly') {
            $start = Carbon::now()->subMonths(11)->startOfMonth();
            $end = Carbon::now()->endOfMonth();

            $res = $this->analyticsService->getSales($pharmacyId, 'monthly', $start->toDateString(), $end->toDateString());
            $seriesData = $res['data'] ?? [];

            $map = [];
            foreach ($seriesData as $row) {
                $map[$row['period']] = (float) ($row['revenue'] ?? 0);
            }

            $labels = [];
            $values = [];

            for ($i = 11; $i >= 0; $i--) {
                $dt = Carbon::now()->subMonths($i);
                $key = $dt->format('Y-m');
                $labels[] = $dt->format('M Y');
                $values[] = $map[$key] ?? 0.0;
            }

            return ['labels' => $labels, 'values' => $values];
        }

        if ($normalizedRange === 'Weekly') {
            $start = Carbon::now()->subWeeks(7)->startOfWeek();
            $end = Carbon::now()->endOfWeek();

            $res = $this->analyticsService->getSales($pharmacyId, 'weekly', $start->toDateString(), $end->toDateString());
            $seriesData = $res['data'] ?? [];

            $map = [];
            foreach ($seriesData as $row) {
                $map[$row['period']] = (float) ($row['revenue'] ?? 0);
            }

            $labels = [];
            $values = [];

            for ($i = 7; $i >= 0; $i--) {
                $dt = Carbon::now()->subWeeks($i)->startOfWeek();
                $key = $dt->toDateString();
                $labels[] = $dt->format('M j');
                $values[] = $map[$key] ?? 0.0;
            }

            return ['labels' => $labels, 'values' => $values];
        }

        // Default: Daily (past 7 days)
        $start = Carbon::now()->subDays(6)->startOfDay();
        $end = Carbon::now()->endOfDay();

        $res = $this->analyticsService->getSales($pharmacyId, 'daily', $start->toDateString(), $end->toDateString());
        $seriesData = $res['data'] ?? [];

        $map = [];
        foreach ($seriesData as $row) {
            $map[$row['period']] = (float) ($row['revenue'] ?? 0);
        }

        $labels = [];
        $values = [];

        for ($i = 6; $i >= 0; $i--) {
            $dt = Carbon::now()->subDays($i);
            $key = $dt->toDateString();
            $labels[] = $dt->format('D');
            $values[] = $map[$key] ?? 0.0;
        }

        return ['labels' => $labels, 'values' => $values];
    }
}
