<?php

namespace App\Services\Pos;

use App\Models\Order;
use App\Repositories\PosRepository;

class PosService
{
    public function __construct(
        private readonly PosRepository $posRepository,
        private readonly PosOrderService $orderService,
        private readonly PosPickupOrderService $pickupOrderService,
    ) {}

    /**
     * Get products for POS with infinite scroll and search functionality.
     */
    public function getProducts(array $filters)
    {
        return $this->posRepository->getAvailableProducts($filters);
    }

    /**
     * Create a new walk-in order from the POS.
     */
    public function createOrder(array $data, $user)
    {
        return $this->orderService->createOrder($data, $user);
    }

    /**
     * Get pickup orders for the pharmacy with search and filtering.
     */
    public function getPickupOrders(array $filters, $user)
    {
        return $this->pickupOrderService->getPickupOrders($filters, $user);
    }

    /**
     * Complete a pickup order and update payment info.
     */
    public function completePickupOrder(Order $order, $paymentMethod, $user, $amountReceived = null, $changeAmount = null, array $discountData = []) {
        return $this->pickupOrderService->completePickupOrder($order, $paymentMethod, $user, $amountReceived, $changeAmount, $discountData);
    }
}
