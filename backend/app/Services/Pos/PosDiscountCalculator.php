<?php

namespace App\Services\Pos;

use App\Models\Pharmacy;

class PosDiscountCalculator
{
    /**
     * Calculate discount amount & percentage based on pharmacy configuration and policy.
     */
    public function calculateDiscount(
        float $subtotal,
        ?string $discountType,
        ?float $discountPercentage,
        ?float $discountAmount,
        ?Pharmacy $pharmacy = null
    ): array {
        if (!$discountType || $discountType === 'none' || $subtotal <= 0) {
            return [0.00, 0.00];
        }

        $calculatedAmount = 0.00;
        $calculatedPercentage = 0.00;

        if ($discountPercentage !== null && $discountPercentage > 0) {
            $calculatedPercentage = min(100.00, max(0.00, $discountPercentage));
            
            // Check if pharmacy settings enable statutory Philippine VAT exemption on Senior / PWD discounts
            $isVatExemptEligible = $pharmacy
                && !empty($pharmacy->enable_vat_exemption_discount)
                && $pharmacy->vat_type === 'vat'
                && in_array(strtolower($discountType), ['senior', 'pwd', 'senior_citizen']);

            if ($isVatExemptEligible) {
                // VAT-exclusive base = subtotal / 1.12
                $vatExclusiveSubtotal = round($subtotal / 1.12, 2);
                $calculatedAmount = round($vatExclusiveSubtotal * ($calculatedPercentage / 100), 2);
            } else {
                // Standard percentage discount applied to subtotal
                $calculatedAmount = round($subtotal * ($calculatedPercentage / 100), 2);
            }
        } elseif ($discountAmount !== null && $discountAmount > 0) {
            $calculatedAmount = min($subtotal, max(0.00, $discountAmount));
            $calculatedPercentage = round(($calculatedAmount / $subtotal) * 100, 2);
        }

        return [
            round($calculatedAmount, 2),
            round($calculatedPercentage, 2)
        ];
    }
}
