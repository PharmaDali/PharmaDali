<?php

namespace App\Services\Inventory;

use App\Enums\TransactionType;
use App\Events\InventoryUpdated;
use App\Models\InventoryLog;
use App\Models\PharmacyProduct;
use Illuminate\Support\Facades\Auth;

class InventoryLogService
{
    /**
     * Record a Stock IN entry when a new product batch is received.
     */
    public function logStockIn(
        int $pharmacyId,
        int $pharmacyProductId,
        ?int $batchId,
        int $quantity,
        string $reason
    ): void {
        $snapshot = $this->resolveProductSnapshot($pharmacyProductId);

        InventoryLog::create([
            'pharmacy_id'          => $pharmacyId,
            'pharmacy_product_id'  => $pharmacyProductId,
            'product_name'         => $snapshot['product_name'],
            'unit_cost'            => $snapshot['unit_cost'],
            'selling_price'        => $snapshot['selling_price'],
            'product_batch_id'     => $batchId,
            'user_id'              => Auth::id(),
            'transaction_type'     => TransactionType::STOCK_IN,
            'quantity'             => $quantity,
            'reason'               => $reason,
        ]);

        InventoryUpdated::dispatch($pharmacyId);
    }

    /**
     * Record a Stock OUT entry when stock is deducted from a batch (order or POS sale).
     */
    public function logStockOut(
        int $pharmacyId,
        int $pharmacyProductId,
        ?int $batchId,
        int $quantity,
        string $reason
    ): void {
        $snapshot = $this->resolveProductSnapshot($pharmacyProductId);

        InventoryLog::create([
            'pharmacy_id'          => $pharmacyId,
            'pharmacy_product_id'  => $pharmacyProductId,
            'product_name'         => $snapshot['product_name'],
            'unit_cost'            => $snapshot['unit_cost'],
            'selling_price'        => $snapshot['selling_price'],
            'product_batch_id'     => $batchId,
            'user_id'              => Auth::id(),
            'transaction_type'     => TransactionType::STOCK_OUT,
            'quantity'             => $quantity,
            'reason'               => $reason,
        ]);

        InventoryUpdated::dispatch($pharmacyId);
    }

    /**
     * Record a Manual Adjustment when an admin edits a batch stock count.
     *
     * If the new stock is lower than the old stock, it is treated as waste/disposal.
     */
    public function logAdjustment(
        int $pharmacyId,
        int $pharmacyProductId,
        int $batchId,
        int $oldStock,
        int $newStock,
        string $reason = 'Manual stock adjustment'
    ): void {
        $delta = abs($newStock - $oldStock);

        if ($delta === 0) {
            return;
        }

        $type = ($newStock < $oldStock) ? TransactionType::WASTE : TransactionType::ADJUSTMENT;
        $snapshot = $this->resolveProductSnapshot($pharmacyProductId);

        InventoryLog::create([
            'pharmacy_id'          => $pharmacyId,
            'pharmacy_product_id'  => $pharmacyProductId,
            'product_name'         => $snapshot['product_name'],
            'unit_cost'            => $snapshot['unit_cost'],
            'selling_price'        => $snapshot['selling_price'],
            'product_batch_id'     => $batchId,
            'user_id'              => Auth::id(),
            'transaction_type'     => $type,
            'quantity'             => $delta,
            'reason'               => $reason,
        ]);

        InventoryUpdated::dispatch($pharmacyId);
    }

    /**
     * Record an audit trail entry when a product is deleted from inventory.
     */
    public function logProductDeleted(
        int $pharmacyId,
        ?int $pharmacyProductId,
        string $productName,
        int $quantity,
        ?float $unitCost = null,
        ?float $sellingPrice = null,
        ?string $reason = null
    ): void {
        InventoryLog::create([
            'pharmacy_id'          => $pharmacyId,
            'pharmacy_product_id'  => $pharmacyProductId,
            'product_name'         => $productName,
            'unit_cost'            => $unitCost,
            'selling_price'        => $sellingPrice,
            'user_id'              => Auth::id(),
            'transaction_type'     => TransactionType::PRODUCT_DELETED,
            'quantity'             => $quantity,
            'reason'               => $reason ?? 'Product permanently deleted from inventory',
        ]);

        InventoryUpdated::dispatch($pharmacyId);
    }

    private function resolveProductSnapshot(int $pharmacyProductId): array
    {
        try {
            $pp = PharmacyProduct::with('product')->find($pharmacyProductId);
            if ($pp) {
                $p = $pp->product;
                $nameParts = array_filter([
                    $p?->product_name,
                    ($p?->strength && !in_array(strtolower(trim($p->strength)), ['n/a', 'na', 'n.a', 'n.a.'])) ? trim($p->strength) : null,
                    ($p?->size && !in_array(strtolower(trim($p->size)), ['n/a', 'na', 'n.a', 'n.a.'])) ? trim($p->size) : null,
                ]);

                return [
                    'product_name'  => implode(' ', $nameParts),
                    'unit_cost'     => $pp->unit_cost ? (float) $pp->unit_cost : null,
                    'selling_price' => $pp->selling_price ? (float) $pp->selling_price : null,
                ];
            }
        } catch (\Throwable $e) {
        }

        return [
            'product_name'  => null,
            'unit_cost'     => null,
            'selling_price' => null,
        ];
    }
}
