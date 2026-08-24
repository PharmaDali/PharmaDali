<?php

namespace App\Http\Controllers\Discount;

use App\Http\Controllers\Controller;
use App\Http\Requests\Discount\StoreDiscountRequest;
use App\Http\Requests\Discount\UpdateDiscountRequest;
use App\Models\Discount;
use App\Services\Discount\DiscountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DiscountController extends Controller
{
    protected DiscountService $service;

    public function __construct(DiscountService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request): JsonResponse
    {
        $pharmacyId = $request->user()->pharmacy_id;
        if (!$pharmacyId) {
            return $this->errorResponse('User is not assigned to a pharmacy.', 403);
        }

        $all = $request->boolean('all', false);
        $cacheKey = "pharmacy_{$pharmacyId}_discounts_" . ($all ? 'all' : 'active');

        $discounts = Cache::remember($cacheKey, 3600, function () use ($pharmacyId, $all) {
            return $all
                ? $this->service->getDiscountsForPharmacy($pharmacyId)
                : $this->service->getActiveDiscountsForPharmacy($pharmacyId);
        });

        return $this->successResponse($discounts, 'Discount policies retrieved successfully.');
    }

    public function store(StoreDiscountRequest $request): JsonResponse
    {
        $pharmacyId = $request->user()->pharmacy_id;
        if (!$pharmacyId) {
            return $this->errorResponse('User is not assigned to a pharmacy.', 403);
        }

        $discount = $this->service->createDiscount($pharmacyId, $request->validated());

        $this->clearDiscountCache($pharmacyId);

        return $this->successResponse($discount, 'Discount policy created successfully.', 201);
    }

    public function update(UpdateDiscountRequest $request, int $id): JsonResponse
    {
        $pharmacyId = $request->user()->pharmacy_id;
        $discount = Discount::where('id', $id)->where('pharmacy_id', $pharmacyId)->first();

        if (!$discount) {
            return $this->errorResponse('Discount policy not found.', 404);
        }

        $updated = $this->service->updateDiscount($discount, $request->validated());

        $this->clearDiscountCache($pharmacyId);

        return $this->successResponse($updated, 'Discount policy updated successfully.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $pharmacyId = $request->user()->pharmacy_id;
        $discount = Discount::where('id', $id)->where('pharmacy_id', $pharmacyId)->first();

        if (!$discount) {
            return $this->errorResponse('Discount policy not found.', 404);
        }

        $this->service->deleteDiscount($discount);

        $this->clearDiscountCache($pharmacyId);

        return $this->successResponse(null, 'Discount policy deleted successfully.');
    }

    private function clearDiscountCache(int $pharmacyId): void
    {
        Cache::forget("pharmacy_{$pharmacyId}_discounts_all");
        Cache::forget("pharmacy_{$pharmacyId}_discounts_active");
    }
}
