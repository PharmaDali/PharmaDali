<?php

namespace App\Services\Inventory;

use App\Events\InventoryUpdated;
use App\Models\InventoryLog;
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
        InventoryLog::create([
            'pharmacy_id'          => $pharmacyId,
            'pharmacy_product_id'  => $pharmacyProductId,
            'product_batch_id'     => $batchId,
            'user_id'              => Auth::id(),
            'transaction_type'     => 'stock_in',
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
        InventoryLog::create([
            'pharmacy_id'          => $pharmacyId,
            'pharmacy_product_id'  => $pharmacyProductId,
            'product_batch_id'     => $batchId,
            'user_id'              => Auth::id(),
            'transaction_type'     => 'stock_out',
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

        $type = ($newStock < $oldStock) ? 'waste' : 'adjustment';

        InventoryLog::create([
            'pharmacy_id'          => $pharmacyId,
            'pharmacy_product_id'  => $pharmacyProductId,
            'product_batch_id'     => $batchId,
            'user_id'              => Auth::id(),
            'transaction_type'     => $type,
            'quantity'             => $delta,
            'reason'               => $reason,
        ]);

        InventoryUpdated::dispatch($pharmacyId);
    }
}
