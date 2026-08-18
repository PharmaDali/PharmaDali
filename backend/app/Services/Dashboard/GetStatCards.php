<?php

namespace App\Services\Dashboard;

use App\Repositories\DashboardRepository;
use App\Services\Inventory\InventoryService;
use App\Services\Inventory\RestockPredictorService;
use App\Services\Order\OrderService;

class GetStatCards
{
    public function __construct(
        protected DashboardRepository $dashboardRepository,
        protected OrderService $orderService,
        protected InventoryService $inventoryService,
        protected RestockPredictorService $restockService
    ) {}

    /**
     * Compute dashboard stat cards metrics.
     */
    public function handle(int $pharmacyId): array
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
}
