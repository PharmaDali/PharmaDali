<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddToCartRequest;
use App\Services\Cart\CustomerCartService;
use Illuminate\Http\JsonResponse;

class CustomerCartController extends Controller
{
    public function __construct(
        private readonly CustomerCartService $customerCartService,
    ) {}

    /**
     * Add a product to the authenticated customer's active cart.
     */
    public function addItem(AddToCartRequest $request): JsonResponse
    {
        return $this->customerCartService->addItem(
            $request->user(),
            $request->validated(),
        );
    }
}
