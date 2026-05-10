<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Forecast\ForecastSyncService;
use Illuminate\Http\JsonResponse;

class ForecastSyncController extends Controller
{
    public function __construct(
        private readonly ForecastSyncService $forecastSyncService,
    ) {}

    public function sync(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->forecastSyncService->syncAll(),
        ]);
    }
}
