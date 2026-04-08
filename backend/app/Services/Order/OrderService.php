<?php

namespace App\Services\Order;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class OrderService
{
    public function __construct(
        private readonly ListOrdersService $listOrdersService,
        private readonly PlaceOrderService $placeOrderService,
        private readonly ShowOrderService $showOrderService,
        private readonly ReviewOrderService $reviewOrderService,
        private readonly UpdateCustomerOrderService $updateCustomerOrderService,
        private readonly CancelCustomerOrderService $cancelCustomerOrderService,
        private readonly RejectPharmacistOrderService $rejectPharmacistOrderService,
        private readonly CancelPharmacistOrderService $cancelPharmacistOrderService,
    ) {}

    public function index(?User $user): JsonResponse
    {
        return $this->listOrdersService->handle($user);
    }

    public function store(?User $user, array $payload): JsonResponse
    {
        return $this->placeOrderService->handle($user, $payload);
    }

    public function show(?User $user, Order $order): JsonResponse
    {
        return $this->showOrderService->handle($user, $order);
    }

    public function review(?User $user, Order $order): JsonResponse
    {
        return $this->reviewOrderService->handle($user, $order);
    }

    public function updateByCustomer(?User $user, Order $order, array $payload): JsonResponse
    {
        return $this->updateCustomerOrderService->handle($user, $order, $payload);
    }

    public function cancelByCustomer(?User $user, Order $order, string $reason): JsonResponse
    {
        return $this->cancelCustomerOrderService->handle($user, $order, $reason);
    }

    public function rejectByPharmacist(?User $user, Order $order, string $reason): JsonResponse
    {
        return $this->rejectPharmacistOrderService->handle($user, $order, $reason);
    }

    public function cancelByPharmacist(?User $user, Order $order, string $reason): JsonResponse
    {
        return $this->cancelPharmacistOrderService->handle($user, $order, $reason);
    }
}
