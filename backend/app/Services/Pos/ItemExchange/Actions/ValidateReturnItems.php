<?php

namespace App\Services\Pos\ItemExchange\Actions;

use App\Models\Order;

class ValidateReturnItems
{
    /**
     * Validate returned items against order history and prepare subtotal values.
     */
    public function execute(Order $order, array $returnedItemsInput): array
    {
        if (empty($returnedItemsInput)) {
            throw new \Exception("At least one returned item must be selected for exchange.");
        }

        $orderItemsMap = $order->items->keyBy('id');

        $exchangedQuantities = [];
        foreach ($order->exchanges as $exchangeRecord) {
            foreach ($exchangeRecord->returnedItems as $retItem) {
                $exchangedQuantities[$retItem->order_item_id] = ($exchangedQuantities[$retItem->order_item_id] ?? 0) + $retItem->quantity;
            }
        }

        $totalReturnedValue = 0.00;
        $preparedReturnedItems = [];

        foreach ($returnedItemsInput as $retInput) {
            $orderItemId = $retInput['order_item_id'];
            $returnQty = (int) ($retInput['quantity'] ?? 0);
            $condition = strtolower($retInput['condition'] ?? 'resalable');

            if ($returnQty <= 0) {
                continue;
            }

            if (!$orderItemsMap->has($orderItemId)) {
                throw new \Exception("Item ID {$orderItemId} does not belong to Order #{$order->order_number}.");
            }

            $orderItem = $orderItemsMap->get($orderItemId);
            $alreadyReturned = $exchangedQuantities[$orderItemId] ?? 0;
            $maxReturnable = $orderItem->quantity - $alreadyReturned;

            if ($returnQty > $maxReturnable) {
                throw new \Exception("Cannot return {$returnQty} units of {$orderItem->product_name}. Only {$maxReturnable} units are eligible.");
            }

            $unitPrice = (float) $orderItem->unit_price_snapshot;
            $subtotal = round($unitPrice * $returnQty, 2);
            $totalReturnedValue += $subtotal;

            $preparedReturnedItems[] = [
                'order_item' => $orderItem,
                'pharmacy_product_id' => $orderItem->pharmacy_product_id,
                'quantity' => $returnQty,
                'unit_price_snapshot' => $unitPrice,
                'subtotal' => $subtotal,
                'condition' => in_array($condition, ['resalable', 'damaged', 'expired']) ? $condition : 'resalable',
            ];
        }

        if (empty($preparedReturnedItems)) {
            throw new \Exception("Valid returned items with quantity > 0 are required.");
        }

        return [
            'totalValue' => $totalReturnedValue,
            'items' => $preparedReturnedItems,
        ];
    }
}
