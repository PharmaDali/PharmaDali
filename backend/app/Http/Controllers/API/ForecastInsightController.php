<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Forecast\ForecastInsightService;
use App\Models\ForecastInsight;
use App\Jobs\GenerateForecastInsightJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForecastInsightController extends Controller
{
    public function __construct(
        private readonly ForecastInsightService $forecastInsightService,
    ) {
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $demandGranularity = $request->input('demand_granularity', 'weekly');
        $salesGranularity = $request->input('sales_granularity', 'weekly');

        // Return whatever is already stored
        $existing = ForecastInsight::query()
            ->where('tenant_id', $user->pharmacy_id)
            ->where('demand_granularity', $demandGranularity)
            ->where('sales_granularity', $salesGranularity)
            ->latest('week_start')
            ->first();

        // Kick off background generation regardless
        GenerateForecastInsightJob::dispatch($user, $demandGranularity, $salesGranularity);

        return response()->json([
            'status' => 'success',
            'data' => [
                'demand' => $existing?->demand ?? 'Generating insight, please check back shortly.',
                'sales' => $existing?->sales ?? 'Generating insight, please check back shortly.',
            ],
        ]);
    }
}
