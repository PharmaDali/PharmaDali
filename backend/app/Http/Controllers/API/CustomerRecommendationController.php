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
        ]);

        $customer = $request->user();
        $pharmacyId = $request->input('pharmacy_id');
        
        $data = $this->recommendationService->getRecommendations($customer, $pharmacyId);

        return response()->json($data);
    }
}
