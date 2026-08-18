<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function overview(Request $request): JsonResponse
    {
        $pharmacyId = $request->input('pharmacy_id') ? (int) $request->input('pharmacy_id') : null;
        $data = $this->dashboardService->getDashboardOverview($pharmacyId);

        return $this->successResponse($data, 'Dashboard overview fetched successfully.');
    }

    public function salesTrend(Request $request): JsonResponse
    {
        $pharmacyId = $request->input('pharmacy_id') ? (int) $request->input('pharmacy_id') : null;
        $data = $this->dashboardService->getSalesTrend($pharmacyId, $request->input('range', 'Weekly'));

        return $this->successResponse($data, 'Sales trend fetched successfully.');
    }
}
