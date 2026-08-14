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
        if ($request->user()->role === 'pharmacist') {
            return $this->errorResponse('Pharmacists are not authorized to view the dashboard.', 403);
        }

        $pharmacyId = $request->user()->pharmacy_id;

        if (!$pharmacyId) {
            return $this->errorResponse('Pharmacy context required.', 400);
        }

        $data = $this->dashboardService->getDashboardOverview($pharmacyId);

        return $this->successResponse($data, 'Dashboard overview fetched successfully.');
    }

    public function salesTrend(Request $request): JsonResponse
    {
        if ($request->user()->role === 'pharmacist') {
            return $this->errorResponse('Pharmacists are not authorized to view the dashboard.', 403);
        }

        $pharmacyId = $request->user()->pharmacy_id;
        $range = $request->input('range', 'Weekly');

        if (!$pharmacyId) {
            return $this->errorResponse('Pharmacy context required.', 400);
        }

        $data = $this->dashboardService->getSalesTrend($pharmacyId, $range);

        return $this->successResponse($data, 'Sales trend fetched successfully.');
    }
}
