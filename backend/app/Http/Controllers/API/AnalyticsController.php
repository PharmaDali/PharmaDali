<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Services\AprioriService;
use App\Services\GeminiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function __construct(
        protected AnalyticsService $analyticsService,
        protected AprioriService $aprioriService,
        protected GeminiService $geminiService
    ) {}

    /**
     * Get Sales Analytics (Timeseries)
     */
    public function sales(Request $request): JsonResponse
    {
        $request->validate([
            'timeframe' => 'sometimes|string|in:daily,weekly,monthly,yearly',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
        ]);

        $pharmacyId = $request->user()->pharmacy_id;
        
        if (!$pharmacyId && $request->has('pharmacy_id')) {
            $pharmacyId = $request->input('pharmacy_id');
        }

        $timeframe = $request->input('timeframe', 'daily');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $data = $this->analyticsService->getSales((int)$pharmacyId, $timeframe, $startDate, $endDate);

        return response()->json($data);
    }

    /**
     * Get Demand Analytics (Top Products)
     */
    public function demand(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after_or_equal:start_date',
            'limit' => 'sometimes|integer|min:1|max:50',
        ]);

        $pharmacyId = $request->user()->pharmacy_id;
        if (!$pharmacyId && $request->has('pharmacy_id')) {
            $pharmacyId = $request->input('pharmacy_id');
        }

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $limit = $request->input('limit', 10);

        $data = $this->analyticsService->getDemand((int)$pharmacyId, $startDate, $endDate, $limit);

        return response()->json($data);
    }

    /**
     * Get Frequently Bought Together Rules (Apriori)
     */
    public function apriori(Request $request): JsonResponse
    {
        $request->validate([
            'months' => 'sometimes|integer|min:1|max:24',
            'min_support' => 'sometimes|numeric|min:0.01|max:1.0',
            'min_confidence' => 'sometimes|numeric|min:0.01|max:1.0',
        ]);

        $pharmacyId = $request->user()->pharmacy_id;
        if (!$pharmacyId && $request->has('pharmacy_id')) {
            $pharmacyId = $request->input('pharmacy_id');
        }

        $months = $request->input('months', 6);
        $minSupport = $request->input('min_support', 0.05);
        $minConfidence = $request->input('min_confidence', 0.2);

        $data = $this->aprioriService->generateFrequentlyBoughtTogether((int)$pharmacyId, $months, $minSupport, $minConfidence);

        return response()->json($data);
    }

    /**
     * Get Gemini AI Insights for Demand or Sales
     */
    public function insights(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'sometimes|string|in:demand,sales',
        ]);

        $pharmacyId = $request->user()->pharmacy_id;
        if (!$pharmacyId && $request->has('pharmacy_id')) {
            $pharmacyId = $request->input('pharmacy_id');
        }

        $type = $request->input('type', 'demand');
        $data = $this->geminiService->getAnalyticsInsights((int)$pharmacyId, $type);

        return response()->json($data);
    }
}
