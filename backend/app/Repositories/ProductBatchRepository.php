<?php

namespace App\Repositories;

use App\Models\BranchProduct;
use App\Models\ProductBatch;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ProductBatchRepository
{
    /**
     * Get all batches for a given branch_product, ordered by nearest expiry first.
     */
    public function getBatchesForBranchProduct(int $branchProductId): Collection
    {
        return ProductBatch::where('branch_product_id', $branchProductId)
            ->orderByRaw('CASE WHEN expiry_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('expiry_date')
            ->get();
    }

    /**
     * Create a new batch for a branch_product and sync the branch_product stock total.
     */
    public function createBatch(int $branchProductId, array $data): ProductBatch
    {
        $batch = ProductBatch::create([
            'branch_product_id' => $branchProductId,
            'batch_number'      => $data['batch_number'] ?? null,
            'stock'             => $data['stock'] ?? 0,
            'expiry_date'       => $data['expiry_date'] ?? null,
            'manufactured_date' => $data['manufactured_date'] ?? null,
            'received_at'       => $data['received_at'] ?? now(),
        ]);

        $this->syncBranchProductStock($branchProductId);

        return $batch->fresh();
    }

    /**
     * Update a batch's stock (mid-level: direct edit allowed, syncs parent total).
     */
    public function updateBatchStock(ProductBatch $batch, int $newStock): ProductBatch
    {
        $batch->update(['stock' => max(0, $newStock)]);
        $this->syncBranchProductStock($batch->branch_product_id);

        return $batch->fresh();
    }

    /**
     * Recalculate and update branch_products.stock as the SUM of all batch stocks.
     * Also updates branch_products.expiry_date to the nearest upcoming batch expiry.
     */
    public function syncBranchProductStock(int $branchProductId): void
    {
        $batches = ProductBatch::where('branch_product_id', $branchProductId)->get();

        $totalStock = $batches->sum('stock');

        // Nearest upcoming expiry among all batches
        $nearestExpiry = $batches
            ->filter(fn ($b) => !is_null($b->expiry_date))
            ->sortBy('expiry_date')
            ->first()?->expiry_date;

        BranchProduct::where('id', $branchProductId)->update([
            'stock'       => $totalStock,
            'expiry_date' => $nearestExpiry instanceof Carbon ? $nearestExpiry->toDateString() : null,
        ]);
    }

    /**
     * Deduct stock from batches using FEFO (First Expiry, First Out).
     * Non-expiring batches are consumed last.
     *
     * @return array<int, array{batch_id: int, batch_number: string|null, deducted: int}> Log of deductions per batch.
     * @throws \InvalidArgumentException if requested quantity exceeds available stock.
     */
    public function stockOutFefo(int $branchProductId, int $quantity): array
    {
        $batches = $this->getBatchesForBranchProduct($branchProductId);

        $totalAvailable = $batches->sum('stock');
        if ($quantity > $totalAvailable) {
            throw new \InvalidArgumentException(
                "Insufficient stock. Requested {$quantity}, available {$totalAvailable}."
            );
        }

        $remaining = $quantity;
        $log       = [];

        foreach ($batches as $batch) {
            if ($remaining <= 0) {
                break;
            }

            $deduct = min($batch->stock, $remaining);
            $batch->update(['stock' => $batch->stock - $deduct]);
            $remaining -= $deduct;

            $log[] = [
                'batch_id'     => $batch->id,
                'batch_number' => $batch->batch_number,
                'deducted'     => $deduct,
            ];
        }

        $this->syncBranchProductStock($branchProductId);

        return $log;
    }
}
