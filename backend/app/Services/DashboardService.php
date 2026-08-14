<?php

namespace App\Services;

use App\Repositories\DashboardRepository;
use App\Repositories\OrderRepository;
use App\Services\Order\OrderService;
use App\Services\Inventory\InventoryService;
use App\Services\Inventory\RestockPredictorService;
use Carbon\Carbon;

class DashboardService
{
    public function __construct(
        protected DashboardRepository $dashboardRepository,
        protected OrderRepository $orderRepository,
        protected OrderService $orderService,
        protected AnalyticsService $analyticsService,
        protected InventoryService $inventoryService,
        protected RestockPredictorService $restockService
    ) {}

    public function getDashboardOverview(int $pharmacyId): array
    {
        return [
            'stat_cards'       => $this->getStatCards($pharmacyId),
            'quick_insights'   => $this->getQuickInsights($pharmacyId),
            'sales_trend'      => [
                'Daily'   => $this->getSalesTrend($pharmacyId, 'Daily'),
                'Weekly'  => $this->getSalesTrend($pharmacyId, 'Weekly'),
                'Monthly' => $this->getSalesTrend($pharmacyId, 'Monthly'),
            ],
            'inventory_health' => $this->getInventoryHealth($pharmacyId),
        ];
    }

    public function getStatCards(int $pharmacyId): array
    {
        // Reuse existing OrderService getTodayStats()
        $todayStats  = $this->orderService->getTodayStats();
        $salesToday  = (float) ($todayStats['total_sales'] ?? 0);
        $ordersToday = (int) ($todayStats['total_orders'] ?? 0);

        $inventoryValue = $this->dashboardRepository->getInventoryTotalValue($pharmacyId);

        // Reuse existing InventoryService metrics for stock levels
        $inventoryMetrics = $this->inventoryService->getInventoryMetrics();
        $lowStockCount = $inventoryMetrics['low_stocks'] ?? 0;
        $expiringCount = $inventoryMetrics['expiring'] ?? 0;

        // Reuse existing RestockPredictorService for risk assessment
        $priorityRestocks = $this->restockService->getPriorityRestocks($pharmacyId);
        $predictedRiskCount = count($priorityRestocks);

        $riskLevel = $predictedRiskCount > 5 ? 'High' : ($predictedRiskCount > 0 ? 'Medium' : 'Low');

        return [
            'sales_today'             => $salesToday,
            'orders_today'            => $ordersToday,
            'inventory_value'         => $inventoryValue,
            'expiring_count'          => $expiringCount,
            'low_stock_count'         => $lowStockCount,
            'predicted_stockout_risk' => $riskLevel,
        ];
    }

    public function getQuickInsights(int $pharmacyId): array
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30)->toDateString();
        $today = Carbon::today()->toDateString();

        // 1. Top Selling Product (via AnalyticsService)
        $demandResult = $this->analyticsService->getDemand($pharmacyId, $thirtyDaysAgo, $today, 1);
        $topDemandItem = $demandResult['data'][0] ?? null;

        // 2. Top Category (last 30 days)
        $thirtyDaysAgo = Carbon::now()->subDays(30)->startOfDay()->toDateTimeString();
        $topCategory = $this->dashboardRepository->getTopCategory($pharmacyId, $thirtyDaysAgo);

        $totalRev30Days = (float) \App\Models\Order::where('pharmacy_id', $pharmacyId)
            ->where('status', 'completed')
            ->where('completed_at', '>=', $thirtyDaysAgo)
            ->sum('total_amount');

        $topCatPct = ($totalRev30Days > 0 && $topCategory)
            ? min(100, round(($topCategory->category_rev / $totalRev30Days) * 100, 1))
            : 0;

        // 3. Sales Growth (Past 7 Days vs Prior 7 Days)
        $sevenDaysAgo = Carbon::now()->subDays(6)->startOfDay()->toDateTimeString();
        $thirteenDaysAgo = Carbon::now()->subDays(13)->startOfDay()->toDateTimeString();
        $sixDaysAgoEnd = Carbon::now()->subDays(7)->endOfDay()->toDateTimeString();

        $current7DaysSales = (float) \App\Models\Order::where('pharmacy_id', $pharmacyId)
            ->where('status', 'completed')
            ->where('completed_at', '>=', $sevenDaysAgo)
            ->sum('total_amount');

        $prior7DaysSales = (float) \App\Models\Order::where('pharmacy_id', $pharmacyId)
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

    public function getSalesTrend(int $pharmacyId, ?string $range = 'Weekly'): array
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

    public function getInventoryHealth(int $pharmacyId): array
    {
        $today = Carbon::today();

        // 1. Low stock items: reuse RestockPredictorService algorithm
        $priorityRestocks = $this->restockService->getPriorityRestocks($pharmacyId);
        $lowStockItems = collect($priorityRestocks)
            ->take(5)
            ->map(function ($item) {
                $name  = $item['name'] ?? 'Unknown Product';
                $dos   = $item['days_of_stock'] ?? 0;
                $stock = $item['quantity'] ?? 0;
                $weeks = max(1, (int) ceil($dos / 7));
                $wosLabel = $dos <= 7 ? "< 1 week" : "{$weeks} weeks";
                $note  = $dos <= 7 ? "less than 1 week of supply ({$stock} left)" : "{$weeks} weeks of supply ({$stock} left)";

                return [
                    'name'  => $name,
                    'stock' => $stock,
                    'weeks' => $wosLabel,
                    'note'  => $note,
                ];
            })
            ->values()
            ->toArray();

        // Fallback to DashboardRepository if restock predictor returns empty
        if (empty($lowStockItems)) {
            $lowStockItems = $this->dashboardRepository
                ->getFallbackLowStockProducts($pharmacyId, 50, 5)
                ->map(function ($bp) {
                    $name  = $bp->product->product_name ?? 'Unknown Product';
                    $stock = $bp->stock;
                    $note  = "less than 1 week of supply ({$stock} left)";

                    return [
                        'name'  => $name,
                        'stock' => $stock,
                        'weeks' => "< 1 week",
                        'note'  => $note,
                    ];
                })
                ->values()
                ->toArray();
        }

        // 2. Expiring soon items (via DashboardRepository)
        $expiringItems = $this->dashboardRepository
            ->getExpiringSoonBatches($pharmacyId, $today->toDateString(), $today->copy()->addDays(30)->toDateString(), 5)
            ->map(function ($batch) use ($today) {
                $name  = $batch->pharmacyProduct->product->product_name ?? 'Unknown Product';
                $stock = $batch->stock;
                $days  = (int) $today->diffInDays($batch->expiry_date, false);
                $weeks = max(1, (int) ceil($days / 7));
                $daysLabel = $weeks === 1 ? "1 week left" : "{$weeks} weeks left";

                return [
                    'name'  => $name,
                    'stock' => $stock,
                    'weeks' => $daysLabel,
                    'days'  => $daysLabel,
                ];
            })
            ->values()
            ->toArray();

        return [
            'low_stock'     => $lowStockItems,
            'expiring_soon' => $expiringItems,
        ];
    }
}
