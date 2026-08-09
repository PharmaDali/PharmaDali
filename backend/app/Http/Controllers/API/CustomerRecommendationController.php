<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\CustomerRecommendationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerRecommendationController extends Controller
{
    public function __construct(
        protected CustomerRecommendationService $recommendationService
    ) {}

    /**
     * Get dynamic recommendations for the customer dashboard hero section.
     */
    public function hero(Request $request): JsonResponse
    {
        $request->validate([
            'pharmacy_id' => 'required|integer',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $customer = $request->user();
        $pharmacyId = (int) $request->input('pharmacy_id');
        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 10);
        
        $data = $this->recommendationService->getRecommendations($customer, $pharmacyId, $page, $perPage);

        return response()->json($data);
    }
}
