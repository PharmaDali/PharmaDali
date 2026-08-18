<?php

namespace App\Services\Analytics;

class AnalyticsService
{
    public function __construct(
        protected GetSalesAnalytics $getSalesAnalytics,
        protected GetDemandAnalytics $getDemandAnalytics,
        protected GetAnalyticsInsights $getAnalyticsInsights
    ) {
    }

    /**
     * Get Sales Analytics.
     */
    public function getSales(int $pharmacyId, string $timeframe, ?string $startDate = null, ?string $endDate = null): array
    {
        return $this->getSalesAnalytics->handle($pharmacyId, $timeframe, $startDate, $endDate);
    }

    /**
     * Get Demand Analytics (Top Products).
     */
    public function getDemand(int $pharmacyId, ?string $startDate = null, ?string $endDate = null, int $limit = 10): array
    {
        return $this->getDemandAnalytics->handle($pharmacyId, $startDate, $endDate, $limit);
    }

    /**
     * Get AI Insights from Gemini API for demand or sales data.
     */
    public function getAnalyticsInsights(int $pharmacyId, string $type = 'demand'): array
    {
        return $this->getAnalyticsInsights->handle($pharmacyId, $type);
    }
}
