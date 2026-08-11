<?php

namespace App\Services\Pos\ItemExchange\Actions;

use App\Models\ItemExchange;
use App\Models\ExchangeReturnedItem;
use App\Models\PharmacyProduct;
use App\Models\Order;
use App\Services\Inventory\InventoryLogService;

class ProcessReturnedStock
{
    public function __construct(
        private readonly InventoryLogService $logService,
    ) {}

    /**
     * Record returned items DB rows and apply stock adjustments with Eloquent observers.
     */
    public function execute(ItemExchange $exchange, array $preparedReturnedItems, int $pharmacyId, Order $order): void
    {
        foreach ($preparedReturnedItems as $retData) {
            ExchangeReturnedItem::create([
                'item_exchange_id' => $exchange->id,
                'order_item_id' => $retData['order_item']->id,
                'pharmacy_product_id' => $retData['pharmacy_product_id'],
                'quantity' => $retData['quantity'],
                'unit_price_snapshot' => $retData['unit_price_snapshot'],
                'subtotal' => $retData['subtotal'],
                'condition' => $retData['condition'],
            ]);

            // Instantiating PharmacyProduct model and saving so Eloquent observer fires!
            $pharmacyProduct = PharmacyProduct::findOrFail($retData['pharmacy_product_id']);

            if ($retData['condition'] === 'resalable') {
                $pharmacyProduct->stock += $retData['quantity'];
                $pharmacyProduct->save();

                $this->logService->logStockIn(
                    pharmacyId: $pharmacyId,
                    pharmacyProductId: $pharmacyProduct->id,
                    batchId: null,
                    quantity: $retData['quantity'],
                    reason: "Item Exchange Return (Resalable): Order {$order->order_number}"
                );
            } else {
                // Damaged / Expired return: log waste entry
                $this->logService->logStockOut(
                    pharmacyId: $pharmacyId,
                    pharmacyProductId: $pharmacyProduct->id,
                    batchId: null,
                    quantity: $retData['quantity'],
                    reason: "Item Exchange Return (" . ucfirst($retData['condition']) . "): Order {$order->order_number}"
                );
            }
        }
    }
}
