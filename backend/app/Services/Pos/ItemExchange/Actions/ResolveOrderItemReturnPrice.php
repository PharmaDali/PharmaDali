<?php

namespace App\Services\Pos\ItemExchange\Actions;

use App\Models\Order;

class ResolveOrderItemReturnPrice
{
    /**
     * Compute each order item's effective (discounted) unit price from the parent Order's discount.
     *
     * Because `order_items.unit_price_snapshot` stores the original selling price while discounts
     * are stored at the `orders` level, this calculates the actual price paid per unit for
     * discountable items (`is_discountable = true`) and keeps non-discountable items at full price.
     *
     * @return array<int, array{original_unit_price: float, effective_unit_price: float, is_discounted: bool, discount_percentage: float}>
     */
    public function execute(Order $order): array
    {
        $order->loadMissing('items.pharmacyProduct');

        $discountableSubtotal = 0.0;
        $itemDiscountableMap = [];

        foreach ($order->items as $item) {
            $pharmacyProduct = $item->relationLoaded('pharmacyProduct')
                ? $item->pharmacyProduct
                : $item->pharmacyProduct()->withoutGlobalScopes()->first();

            $isDiscountable = (bool) ($pharmacyProduct?->is_discountable ?? true);
            $itemDiscountableMap[$item->id] = $isDiscountable;

            if ($isDiscountable) {
                $discountableSubtotal += (float) $item->line_total;
            }
        }

        $discountAmount = (float) ($order->discount_amount ?? 0);
        $discountPct = (float) ($order->discount_percentage ?? 0);

        if ($discountableSubtotal > 0 && $discountAmount > 0) {
            $discountRatio = min(1.0, $discountAmount / $discountableSubtotal);
        } elseif ($discountPct > 0) {
            $discountRatio = min(1.0, $discountPct / 100.0);
        } else {
            $discountRatio = 0.0;
        }

        $resolved = [];
        foreach ($order->items as $item) {
            $originalUnitPrice = (float) $item->unit_price_snapshot;
            $isItemDiscountable = $itemDiscountableMap[$item->id] ?? true;

            if ($isItemDiscountable && $discountRatio > 0) {
                $effectiveUnitPrice = max(0.0, round($originalUnitPrice * (1.0 - $discountRatio), 2));
                $isDiscounted = $effectiveUnitPrice < $originalUnitPrice;
            } else {
                $effectiveUnitPrice = $originalUnitPrice;
                $isDiscounted = false;
            }

            $resolved[$item->id] = [
                'original_unit_price'  => $originalUnitPrice,
                'effective_unit_price' => $effectiveUnitPrice,
                'is_discounted'        => $isDiscounted,
                'discount_percentage'  => $isDiscounted ? round($discountRatio * 100, 2) : 0.0,
            ];
        }

        return $resolved;
    }
}
