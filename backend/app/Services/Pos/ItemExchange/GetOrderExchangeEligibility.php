<?php

namespace App\Services\Pos\ItemExchange;

use App\Models\Order;
use App\Models\Pharmacy;
use App\Services\Pharmacy\PharmacyOperatingHoursChecker;
use App\Services\Pos\ItemExchange\Actions\CalculateReturnableOrderItems;

class GetOrderExchangeEligibility
{
    public function __construct(
        private readonly PharmacyOperatingHoursChecker $operatingHoursChecker,
        private readonly CalculateReturnableOrderItems $calculateReturnableItems,
    ) {}

    /**
     * Get eligibility and available return limits for an order.
     */
    public function execute(Order $order, $user): array
    {
        $pharmacyId = $user->pharmacy_id ?? $user->pharmacy?->id ?? $order->pharmacy_id ?? 1;
        $pharmacy = Pharmacy::find($pharmacyId);
        $windowDays = max(1, (int) ($pharmacy?->item_exchange_window_days ?? 1));

        if (!($pharmacy?->allow_item_exchange ?? true)) {
            return [
                'eligible' => false,
                'reason' => 'Item exchange feature is disabled in pharmacy settings.',
                'items' => [],
            ];
        }

        if ($order->status !== 'completed') {
            return [
                'eligible' => false,
                'reason' => "Only completed orders can be exchanged (Order #{$order->order_number} status is currently '{$order->status}').",
                'items' => [],
            ];
        }

        $hoursReason = null;
        if (!$this->operatingHoursChecker->isOrderEligibleWithinHours($pharmacy, $order, $windowDays, $hoursReason)) {
            return [
                'eligible' => false,
                'reason' => $hoursReason,
                'items' => [],
            ];
        }

        $order->load(['items.pharmacyProduct.product', 'exchanges.returnedItems']);

        if ($order->exchanges && $order->exchanges->isNotEmpty()) {
            return [
                'eligible' => false,
                'reason' => 'This order has already been exchanged and cannot be exchanged again.',
                'items' => [],
            ];
        }

        return $this->calculateReturnableItems->execute($order, $windowDays);
    }
}
