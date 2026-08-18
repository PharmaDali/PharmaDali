<?php

namespace App\Services\Dashboard;

use App\Models\Order;
use App\Repositories\DashboardRepository;
use App\Services\Analytics\AnalyticsService;
use App\Services\Order\OrderService;
use Carbon\Carbon;

class GetQuickInsights
{
    public function __construct(
        protected DashboardRepository $dashboardRepository,
        protected OrderService $orderService,
        protected AnalyticsService $analyticsService
    ) {}

    /**
     * Compute dashboard quick insights metrics.
     */
    public function handle(int $pharmacyId): array
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30)->toDateString();
        $today = Carbon::today()->toDateString();

        // 1. Top Selling Product (via AnalyticsService)
        $demandResult = $this->analyticsService->getDemand($pharmacyId, $thirtyDaysAgo, $today, 1);
        $topDemandItem = $demandResult['data'][0] ?? null;

        // 2. Top Category (last 30 days via DashboardRepository)
        $thirtyDaysAgoStart = Carbon::now()->subDays(30)->startOfDay()->toDateTimeString();
        $topCategory = $this->dashboardRepository->getTopCategory($pharmacyId, $thirtyDaysAgoStart);

        $totalRev30Days = (float) Order::where('pharmacy_id', $pharmacyId)
            ->where('status', 'completed')
            ->where('completed_at', '>=', $thirtyDaysAgoStart)
            ->sum('total_amount');

        $topCatPct = ($totalRev30Days > 0 && $topCategory)
            ? min(100, round(($topCategory->category_rev / $totalRev30Days) * 100, 1))
            : 0;

        // 3. Sales Growth (Past 7 Days vs Prior 7 Days)
        $sevenDaysAgo = Carbon::now()->subDays(6)->startOfDay()->toDateTimeString();
        $thirteenDaysAgo = Carbon::now()->subDays(13)->startOfDay()->toDateTimeString();
        $sixDaysAgoEnd = Carbon::now()->subDays(7)->endOfDay()->toDateTimeString();

        $current7DaysSales = (float) Order::where('pharmacy_id', $pharmacyId)
            ->where('status', 'completed')
            ->where('completed_at', '>=', $sevenDaysAgo)
            ->sum('total_amount');

        $prior7DaysSales = (float) Order::where('pharmacy_id', $pharmacyId)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$thirteenDaysAgo, $sixDaysAgoEnd])
            ->sum('total_amount');

        if ($current7DaysSales == 0 && $prior7DaysSales == 0) {
            $growth = 0;
        } elseif ($prior7DaysSales > 0) {
            $growth = round((($current7DaysSales - $prior7DaysSales) / $prior7DaysSales) * 100, 1);
        } else {
            $growth = 100;
        }

        $growthStr = ($growth > 0 ? '+' : '') . $growth . '%';

        // 4. Profit Today (using OrderService today sales)
        $todayStats = $this->orderService->getTodayStats();
        $salesToday = (float) ($todayStats['total_sales'] ?? 0);
        $estProfitToday = $salesToday * 0.30;

        return [
            [
                'category' => 'Top Selling',
                'main'     => $topDemandItem->product_name ?? 'No data',
                'right'    => $topDemandItem ? number_format($topDemandItem->total_quantity_sold) : '0',
                'rightSub' => 'units sold',
            ],
            [
                'category' => 'Top Category',
                'main'     => $topCategory->category_name ?? 'No data',
                'right'    => $topCatPct . '%',
                'rightSub' => 'of total sales',
            ],
            [
                'category' => 'Sales Growth',
                'main'     => $growthStr,
                'right'    => $growthStr,
                'rightSub' => 'vs last week',
            ],
            [
                'category' => 'Profit Today',
                'main'     => 'PHP ' . number_format($estProfitToday, 2),
                'right'    => '30%',
                'rightSub' => 'margin',
            ],
        ];
    }
}
