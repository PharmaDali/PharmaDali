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
        private readonly UpdateOrderStatusByPharmacistService $updateOrderStatusByPharmacistService,
        private readonly CustomerOrderActionService $customerOrderActionService,
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

    public function confirmInStorePayment(?User $user, Order $order): JsonResponse
    {
        return $this->customerOrderActionService->confirmInStorePayment($user, $order);
    }

    public function acknowledgeDiscount(?User $user, Order $order): JsonResponse
    {
        return $this->customerOrderActionService->acknowledgeDiscount($user, $order);
    }

    public function removeRxItemsAndProceed(?User $user, Order $order): JsonResponse
    {
        return $this->customerOrderActionService->removeRxItemsAndProceed($user, $order);
    }

    public function updateStatusByPharmacist(?User $user, Order $order, string $action, ?string $reason = null, ?string $section = null): JsonResponse
    {
        return $this->updateOrderStatusByPharmacistService->handle(
            $user,
            $order,
            $action,
            $reason,
            $section,
        );
    }

    public function countTotalOrders(): int
    {
        return (new CountTotalOrderService())->handle();
    }

    public function getTodayStats(): array
    {
        return (new GetTodayStatsService())->handle();
    }
}
