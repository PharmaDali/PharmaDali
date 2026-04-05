<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddToCartRequest;
use App\Services\Cart\CustomerCartService;
use App\Services\Cart\ViewCustomerCart;
use Illuminate\Http\JsonResponse;

class CustomerCartController extends Controller
{
    public function __construct(
        private readonly CustomerCartService $customerCartService,
        private readonly ViewCustomerCart $viewCustomerCart,
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

    public function viewCart(): JsonResponse
    {
        return $this->viewCustomerCart->handle(request()->user());
    }

    public function countCartItems(): JsonResponse
    {
        return $this->customerCartService->countCartItems(request()->user());
    }
}
