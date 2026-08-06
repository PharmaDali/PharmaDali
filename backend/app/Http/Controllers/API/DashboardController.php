<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function overview(Request $request): JsonResponse
    {
        $pharmacyId = $request->user()->pharmacy_id;

        if (!$pharmacyId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Pharmacy context required.',
            ], 400);
        }

        $data = $this->dashboardService->getDashboardOverview($pharmacyId);

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }

    public function salesTrend(Request $request): JsonResponse
    {
        $pharmacyId = $request->user()->pharmacy_id;
        $range = $request->input('range', 'Weekly');

        if (!$pharmacyId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Pharmacy context required.',
            ], 400);
        }

        $data = $this->dashboardService->getSalesTrend($pharmacyId, $range);

        return response()->json([
            'status' => 'success',
            'data'   => $data,
        ]);
    }
}
