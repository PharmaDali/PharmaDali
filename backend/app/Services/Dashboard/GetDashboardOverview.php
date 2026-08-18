<?php

namespace App\Services\Dashboard;

class GetDashboardOverview
{
    public function __construct(
        protected GetStatCards $getStatCards,
        protected GetQuickInsights $getQuickInsights,
        protected GetSalesTrend $getSalesTrend,
        protected GetInventoryHealth $getInventoryHealth
    ) {}

    /**
     * Compute full dashboard overview payload.
     */
    public function handle(int $pharmacyId): array
    {
        return [
            'stat_cards'       => $this->getStatCards->handle($pharmacyId),
            'quick_insights'   => $this->getQuickInsights->handle($pharmacyId),
            'sales_trend'      => [
                'Daily'   => $this->getSalesTrend->handle($pharmacyId, 'Daily'),
                'Weekly'  => $this->getSalesTrend->handle($pharmacyId, 'Weekly'),
                'Monthly' => $this->getSalesTrend->handle($pharmacyId, 'Monthly'),
            ],
            'inventory_health' => $this->getInventoryHealth->handle($pharmacyId),
        ];
    }
}
