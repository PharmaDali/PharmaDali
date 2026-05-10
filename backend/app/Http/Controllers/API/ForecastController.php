<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Forecast\ForecastQueryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForecastController extends Controller
{
    public function __construct(
        private readonly ForecastQueryService $forecastQueryService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'kind' => ['nullable', 'in:sales,demand'],
            'granularity' => ['nullable', 'in:weekly,monthly'],
            'period' => ['nullable', 'in:current,next'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:500'],
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $this->forecastQueryService->listForBranch($request->user(), $filters),
        ]);
    }
}
