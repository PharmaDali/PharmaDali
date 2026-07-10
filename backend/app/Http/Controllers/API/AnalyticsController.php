<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Services\AprioriService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function __construct(
        protected AnalyticsService $analyticsService,
        protected AprioriService $aprioriService
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
        
        // If the user doesn't have a pharmacy_id (e.g. SuperAdmin), we might need to handle it,
        // but typically analytics is viewed per pharmacy.
        if (!$pharmacyId && $request->has('pharmacy_id')) {
            $pharmacyId = $request->input('pharmacy_id');
        }

        $timeframe = $request->input('timeframe', 'daily');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $data = $this->analyticsService->getSales($pharmacyId, $timeframe, $startDate, $endDate);

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

        $data = $this->analyticsService->getDemand($pharmacyId, $startDate, $endDate, $limit);

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

        $months = $request->input('months', 6); // Default 6 months based on user preference
        $minSupport = $request->input('min_support', 0.05);
        $minConfidence = $request->input('min_confidence', 0.2);

        $data = $this->aprioriService->generateFrequentlyBoughtTogether($pharmacyId, $months, $minSupport, $minConfidence);

        return response()->json($data);
    }
}
