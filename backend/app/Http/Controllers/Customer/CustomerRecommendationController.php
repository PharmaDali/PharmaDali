<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\HeroRecommendationRequest;
use App\Services\CustomerRecommendationService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class CustomerRecommendationController extends Controller
{
    use ApiResponseTrait;
    public function __construct(
        protected CustomerRecommendationService $recommendationService
    ) {}

    /**
     * Get dynamic recommendations for the customer dashboard hero section.
     */
    public function hero(HeroRecommendationRequest $request): JsonResponse
    {
        $customer = $request->user();
        $pharmacyId = (int) $request->input('pharmacy_id');
        $page = (int) $request->input('page', 1);
        $perPage = (int) $request->input('per_page', 10);
        
        $data = $this->recommendationService->getRecommendations($customer, $pharmacyId, $page, $perPage);

        return $this->successResponse($data);
    }
}
