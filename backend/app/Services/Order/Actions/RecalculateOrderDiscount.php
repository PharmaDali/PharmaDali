<?php

namespace App\Services\Order\Actions;

use App\Models\Discount;
use App\Models\Order;
use App\Models\Pharmacy;
use App\Services\Pos\PosDiscountCalculator;

class RecalculateOrderDiscount
{
    public function __construct(
        private readonly PosDiscountCalculator $discountCalculator,
    ) {}

    /**
     * Apply and persist the verified discount on an order.
     */
    public function apply(Order $order): Order
    {
        $order->loadMissing(['items', 'pharmacy']);

        $subtotal = (float) $order->items->sum('line_total');
        if ($subtotal <= 0 && (float) $order->subtotal > 0) {
            $subtotal = (float) $order->subtotal;
        }

        $discountableSubtotal = 0.0;
        foreach ($order->items as $item) {
            $pharmacyProduct = $item->relationLoaded('pharmacyProduct')
                ? $item->pharmacyProduct
                : $item->pharmacyProduct()->withoutGlobalScopes()->first();

            $isProductDiscountable = (bool) ($pharmacyProduct?->is_discountable ?? true);
            if ($isProductDiscountable) {
                $discountableSubtotal += (float) $item->line_total;
            }
        }

        $discountType = $order->discount_type ?: 'senior_citizen';
        $pharmacy = $order->pharmacy ?? ($order->pharmacy_id ? Pharmacy::find($order->pharmacy_id) : null);
        $targetPercentage = $this->resolveDiscountPercentage($order, $discountType);

        [$discountAmount, $discountPercentage] = $this->discountCalculator->calculateDiscount(
            subtotal: $subtotal,
            discountType: $discountType,
            discountPercentage: $targetPercentage,
            discountAmount: null,
            pharmacy: $pharmacy,
            discountableSubtotal: $discountableSubtotal,
        );

        $totalAmount = max(0, round($subtotal - $discountAmount, 2));

        $order->update([
            'subtotal'            => $subtotal,
            'discount_type'       => $discountType,
            'discount_percentage' => $discountPercentage,
            'discount_amount'     => $discountAmount,
            'total_amount'        => $totalAmount,
        ]);

        return $order->fresh();
    }

    /**
     * Clear any applied discount amounts on an order (e.g. when a Discount ID is rejected).
     */
    public function clear(Order $order): Order
    {
        $order->loadMissing('items');

        $subtotal = (float) $order->items->sum('line_total');
        if ($subtotal <= 0 && (float) $order->subtotal > 0) {
            $subtotal = (float) $order->subtotal;
        }

        $order->update([
            'subtotal'            => $subtotal,
            'discount_percentage' => 0,
            'discount_amount'     => 0,
            'total_amount'        => $subtotal,
        ]);

        return $order->fresh();
    }

    /**
     * Recalculate order subtotal, discount, and total after item modifications (e.g. removing Rx items).
     */
    public function recalculateAfterItemsChanged(Order $order): Order
    {
        $isApprovedDiscount = strtolower(trim((string) $order->discount_remarks)) === 'approved'
            || (float) $order->discount_percentage > 0
            || (float) $order->discount_amount > 0;

        if ($isApprovedDiscount) {
            return $this->apply($order);
        }

        return $this->clear($order);
    }

    /**
     * Resolve the applicable discount percentage for an order's discount_type.
     */
    private function resolveDiscountPercentage(Order $order, string $discountType): float
    {
        if ((float) $order->discount_percentage > 0) {
            return (float) $order->discount_percentage;
        }

        $normalized = strtolower(trim($discountType));
        $candidateCodes = match ($normalized) {
            'senior_citizen', 'senior' => ['SENIOR', 'SENIOR_CITIZEN'],
            'pwd'                      => ['PWD'],
            'employee'                 => ['EMPLOYEE'],
            'student'                  => ['STUDENT'],
            'diplomat'                 => ['DIPLOMAT'],
            default                    => [strtoupper($normalized)],
        };

        if ($order->pharmacy_id) {
            $configuredDiscount = Discount::query()
                ->where('pharmacy_id', $order->pharmacy_id)
                ->where('is_active', true)
                ->whereIn('code', $candidateCodes)
                ->first();

            if ($configuredDiscount && (float) $configuredDiscount->percentage > 0) {
                return (float) $configuredDiscount->percentage;
            }
        }

        return match ($normalized) {
            'employee' => 10.0,
            default    => 20.0,
        };
    }
}
