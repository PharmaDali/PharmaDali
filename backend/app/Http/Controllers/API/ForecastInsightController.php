<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Forecast\ForecastInsightService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForecastInsightController extends Controller
{
    public function __construct(
        private readonly ForecastInsightService $forecastInsightService,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'demand_granularity' => ['nullable', 'in:weekly,monthly'],
            'sales_granularity' => ['nullable', 'in:weekly,monthly'],
        ]);

        $demandGranularity = $filters['demand_granularity'] ?? 'weekly';
        $salesGranularity = $filters['sales_granularity'] ?? 'weekly';

        return response()->json([
            'status' => 'success',
            'data' => $this->forecastInsightService->generate(
                $request->user(),
                $demandGranularity,
                $salesGranularity,
            ),
        ]);
    }
}
