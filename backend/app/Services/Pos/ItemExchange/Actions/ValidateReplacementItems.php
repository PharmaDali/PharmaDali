<?php

namespace App\Services\Pos\ItemExchange\Actions;

use App\Models\PharmacyProduct;

class ValidateReplacementItems
{
    /**
     * Validate replacement stock levels and prepare subtotal values.
     */
    public function execute(int $pharmacyId, array $replacementItemsInput): array
    {
        if (empty($replacementItemsInput)) {
            throw new \Exception("At least one replacement item must be selected for exchange.");
        }

        $totalReplacementValue = 0.00;
        $preparedReplacementItems = [];

        foreach ($replacementItemsInput as $repInput) {
            $productId = $repInput['pharmacy_product_id'] ?? $repInput['id'] ?? null;
            $repQty = (int) ($repInput['quantity'] ?? $repInput['qty'] ?? 0);

            if ($repQty <= 0) {
                continue;
            }

            $pharmacyProduct = PharmacyProduct::with('product')->where('pharmacy_id', $pharmacyId)->findOrFail($productId);

            if ($pharmacyProduct->stock < $repQty) {
                $prodName = $pharmacyProduct->product->product_name ?? 'Item';
                throw new \Exception("Insufficient stock for replacement product {$prodName}. Requested: {$repQty}, Available: {$pharmacyProduct->stock}");
            }

            $unitPrice = (float) $pharmacyProduct->selling_price;
            $subtotal = round($unitPrice * $repQty, 2);
            $totalReplacementValue += $subtotal;

            $preparedReplacementItems[] = [
                'pharmacy_product' => $pharmacyProduct,
                'quantity' => $repQty,
                'unit_price_snapshot' => $unitPrice,
                'subtotal' => $subtotal,
            ];
        }

        if (empty($preparedReplacementItems)) {
            throw new \Exception("Valid replacement items with quantity > 0 are required.");
        }

        return [
            'totalValue' => $totalReplacementValue,
            'items' => $preparedReplacementItems,
        ];
    }
}
