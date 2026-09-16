<?php

namespace App\Services\Pos\ItemExchange\Actions;

use App\Models\ItemExchange;
use App\Models\ExchangeReplacementItem;
use App\Repositories\ProductBatchRepository;
use App\Services\Inventory\InventoryLogService;

class ProcessReplacementStock
{
    public function __construct(
        private readonly InventoryLogService $logService,
        private readonly ProductBatchRepository $batchRepository,
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

            $pharmacyProduct = $repData['pharmacy_product'];

            // If product tracks batches, consume batch stock using FEFO
            if ($pharmacyProduct->batches()->exists()) {
                $deductionLog = $this->batchRepository->stockOutFefo($pharmacyProduct->id, $repData['quantity']);

                foreach ($deductionLog as $batchLog) {
                    $this->logService->logStockOut(
                        pharmacyId: $pharmacyId,
                        pharmacyProductId: $pharmacyProduct->id,
                        batchId: $batchLog['batch_id'],
                        quantity: $batchLog['deducted'],
                        reason: "Item Exchange Replacement: Exchange {$exchangeNumber}"
                    );
                }

                // Ensure model is refreshed and saved so Eloquent observer fires
                $pharmacyProduct->refresh();
                $pharmacyProduct->save();
            } else {
                // Instantiating PharmacyProduct model and saving so Eloquent observer fires!
                $pharmacyProduct->stock -= $repData['quantity'];
                if ($pharmacyProduct->stock <= 0) {
                    $pharmacyProduct->stock = 0;
                    $pharmacyProduct->is_out_of_stock = true;
                    $pharmacyProduct->is_available = false;
                }
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
}
