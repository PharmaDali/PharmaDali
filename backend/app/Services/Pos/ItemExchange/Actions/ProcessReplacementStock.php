<?php

namespace App\Services\Pos\ItemExchange\Actions;

use App\Models\ItemExchange;
use App\Models\ExchangeReplacementItem;
use App\Services\Inventory\InventoryLogService;

class ProcessReplacementStock
{
    public function __construct(
        private readonly InventoryLogService $logService,
    ) {}

    /**
     * Record replacement items DB rows and apply stock decrements with Eloquent observers.
     */
    public function execute(ItemExchange $exchange, array $preparedReplacementItems, int $pharmacyId, string $exchangeNumber): void
    {
        foreach ($preparedReplacementItems as $repData) {
            ExchangeReplacementItem::create([
                'item_exchange_id' => $exchange->id,
                'pharmacy_product_id' => $repData['pharmacy_product']->id,
                'quantity' => $repData['quantity'],
                'unit_price_snapshot' => $repData['unit_price_snapshot'],
                'subtotal' => $repData['subtotal'],
            ]);

            // Instantiating PharmacyProduct model and saving so Eloquent observer fires!
            $pharmacyProduct = $repData['pharmacy_product'];
            $pharmacyProduct->stock -= $repData['quantity'];
            $pharmacyProduct->save();

            $this->logService->logStockOut(
                pharmacyId: $pharmacyId,
                pharmacyProductId: $pharmacyProduct->id,
                batchId: null,
                quantity: $repData['quantity'],
                reason: "Item Exchange Replacement: Exchange {$exchangeNumber}"
            );
        }
    }
}
