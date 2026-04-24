<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\CancelOrderRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdatePharmacistOrderStatusRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Services\Order\OrderService;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
    ) {}

    public function index(): JsonResponse
    {
        return $this->orderService->index(request()->user());
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        return $this->orderService->store(
            $request->user(),
            $request->validated(),
        );
    }

    public function show(Order $order): JsonResponse
    {
        return $this->orderService->show(request()->user(), $order);
    }

    public function review(Order $order): JsonResponse
    {
        return $this->orderService->review(request()->user(), $order);
    }

    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        return $this->orderService->updateByCustomer(
            $request->user(),
            $order,
            $request->validated(),
        );
    }

    public function cancel(CancelOrderRequest $request, Order $order): JsonResponse
    {
        return $this->orderService->cancelByCustomer(
            $request->user(),
            $order,
            $request->validated()['reason'],
        );
    }

    public function updateStatusByPharmacist(UpdatePharmacistOrderStatusRequest $request, Order $order): JsonResponse
    {
        $payload = $request->validated();

        return $this->orderService->updateStatusByPharmacist(
            $request->user(),
            $order,
            $payload['action'],
            $payload['reason'] ?? null,
        );
    }

    public function countTotalOrders(): JsonResponse
    {
        return response()->json([
            'total_orders' => $this->orderService->countTotalOrders(),
        ]);
    }
}
