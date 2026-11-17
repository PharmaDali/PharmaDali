<?php

namespace App\Services\Pos\ItemExchange\Actions;

use App\Models\Order;

class CalculateReturnableOrderItems
{
    public function __construct(
        private readonly ResolveOrderItemReturnPrice $resolveOrderItemReturnPrice,
    ) {}

    /**
     * Build returnable items payload with quantity limits.
     */
    public function execute(Order $order, int $windowDays): array
    {
        $exchangedQuantities = [];
        foreach ($order->exchanges as $exchange) {
            foreach ($exchange->returnedItems as $retItem) {
                $exchangedQuantities[$retItem->order_item_id] = ($exchangedQuantities[$retItem->order_item_id] ?? 0) + $retItem->quantity;
            }
        }

        $resolvedPrices = $this->resolveOrderItemReturnPrice->execute($order);

        $items = [];
        $hasReturnableItems = false;

        foreach ($order->items as $item) {
            $alreadyReturned = $exchangedQuantities[$item->id] ?? 0;
            $maxReturnable = max(0, $item->quantity - $alreadyReturned);

            if ($maxReturnable > 0) {
                $hasReturnableItems = true;
            }

            $priceInfo = $resolvedPrices[$item->id] ?? [
                'original_unit_price'  => (float) $item->unit_price_snapshot,
                'effective_unit_price' => (float) $item->unit_price_snapshot,
                'is_discounted'        => false,
                'discount_percentage'  => 0.0,
            ];

            $effectiveUnitPrice = $priceInfo['effective_unit_price'];

            $items[] = [
                'order_item_id' => $item->id,
                'pharmacy_product_id' => $item->pharmacy_product_id,
                'product_name' => $item->product_name,
                'purchased_quantity' => $item->quantity,
                'already_returned_quantity' => $alreadyReturned,
                'max_returnable_quantity' => $maxReturnable,
                'original_unit_price' => $priceInfo['original_unit_price'],
                'unit_price_snapshot' => $effectiveUnitPrice,
                'line_total' => round($effectiveUnitPrice * $item->quantity, 2),
                'is_discounted' => $priceInfo['is_discounted'],
                'discount_percentage' => $priceInfo['discount_percentage'],
            ];
        }

        if (!$hasReturnableItems) {
            return [
                'eligible' => false,
                'reason' => 'All items in this order have already been returned or exchanged.',
                'items' => $items,
            ];
        }

        return [
            'eligible' => true,
            'reason' => null,
            'window_days' => $windowDays,
            'items' => $items,
        ];
    }
}
