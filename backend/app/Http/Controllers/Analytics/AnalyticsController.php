<?php

namespace App\Http\Controllers\Analytics;

use App\Http\Controllers\Controller;
use App\Http\Requests\Analytics\GetAnalyticsInsightsRequest;
use App\Http\Requests\Analytics\GetAprioriAnalyticsRequest;
use App\Http\Requests\Analytics\GetDemandAnalyticsRequest;
use App\Http\Requests\Analytics\GetSalesAnalyticsRequest;
use App\Services\Analytics\AnalyticsService;
use App\Services\AprioriService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class AnalyticsController extends Controller
{
    public function __construct(
        protected AnalyticsService $analyticsService,
        protected AprioriService $aprioriService
    ) {}

    /**
     * Get Sales Analytics (Timeseries)
     */
    public function sales(GetSalesAnalyticsRequest $request): JsonResponse
    {
        $data = $this->analyticsService->getSales(
            $request->getPharmacyId(),
            $request->input('timeframe', 'daily'),
            $request->input('start_date'),
            $request->input('end_date')
        );

        return $this->successResponse($data, 'Sales analytics retrieved successfully.');
    }

    /**
     * Get Demand Analytics (Top Products)
     */
    public function demand(GetDemandAnalyticsRequest $request): JsonResponse
    {
        $data = $this->analyticsService->getDemand(
            $request->getPharmacyId(),
            $request->input('start_date'),
            $request->input('end_date'),
            (int) $request->input('limit', 10)
        );

        return $this->successResponse($data, 'Demand analytics retrieved successfully.');
    }

    /**
     * Get Frequently Bought Together Rules
     */
    public function apriori(GetAprioriAnalyticsRequest $request): JsonResponse
    {
        $pharmacyId = $request->getPharmacyId();
        $months = (int) $request->input('months', 6);
        $minSupport = (float) $request->input('min_support', 0.05);
        $minConfidence = (float) $request->input('min_confidence', 0.2);

        $cacheKey = "pharmacy_{$pharmacyId}_apriori_{$months}_{$minSupport}_{$minConfidence}";

        $data = Cache::remember($cacheKey, 60 * 60 * 6, function () use ($pharmacyId, $months, $minSupport, $minConfidence) {
            return $this->aprioriService->generateFrequentlyBoughtTogether(
                $pharmacyId,
                $months,
                $minSupport,
                $minConfidence
            );
        });

        return $this->successResponse($data, 'Frequently bought together rules retrieved successfully.');
    }

    /**
     * Get Gemini AI Insights for Demand or Sales
     */
    public function insights(GetAnalyticsInsightsRequest $request): JsonResponse
    {
        $data = $this->analyticsService->getAnalyticsInsights(
            $request->getPharmacyId(),
            $request->input('type', 'demand')
        );

        return $this->successResponse($data, 'Analytics insights retrieved successfully.');
    }
}
