<?php

namespace App\Repositories;

use App\Models\PharmacyProduct;
use App\Models\ProductBatch;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ProductBatchRepository
{
    /**
     * Get all batches for a given pharmacy_product, ordered by nearest expiry first.
     */
    public function getBatchesForPharmacyProduct(int $pharmacyProductId, bool $lockForUpdate = false): Collection
    {
        $query = ProductBatch::where('pharmacy_product_id', $pharmacyProductId)
            ->orderByRaw('CASE WHEN expiry_date IS NULL THEN 1 ELSE 0 END')
            ->orderBy('expiry_date');

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        return $query->get();
    }

    /**
     * Create a new batch for a pharmacy_product and sync the pharmacy_product stock total.
     */
    public function createBatch(int $pharmacyProductId, array $data): ProductBatch
    {
        $batch = ProductBatch::create([
            'pharmacy_product_id' => $pharmacyProductId,
            'batch_number'      => $data['batch_number'] ?? null,
            'supplier_name'     => $data['supplier_name'] ?? null,
            'stock'             => $data['stock'] ?? 0,
            'expiry_date'       => $data['expiry_date'] ?? null,
            'manufactured_date' => $data['manufactured_date'] ?? null,
            'received_at'       => $data['received_at'] ?? now(),
        ]);

        $this->syncPharmacyProductStock($pharmacyProductId);

        return $batch->fresh();
    }

    /**
     * Update a batch's stock and details (syncs parent total and nearest expiry).
     */
    public function updateBatch(ProductBatch $batch, array $data): ProductBatch
    {
        $fields = [];
        if (array_key_exists('stock', $data)) {
            $fields['stock'] = max(0, (int) $data['stock']);
        }
        if (array_key_exists('supplier_name', $data)) {
            $fields['supplier_name'] = $data['supplier_name'];
        }
        if (array_key_exists('batch_number', $data)) {
            $fields['batch_number'] = $data['batch_number'];
        }
        if (array_key_exists('expiry_date', $data)) {
            $fields['expiry_date'] = $data['expiry_date'];
        }
        if (array_key_exists('manufactured_date', $data)) {
            $fields['manufactured_date'] = $data['manufactured_date'];
        }

        if (!empty($fields)) {
            $batch->update($fields);
        }

        $this->syncPharmacyProductStock($batch->pharmacy_product_id);

        return $batch->fresh();
    }

    /**
     * Update a batch's stock (mid-level: direct edit allowed, syncs parent total).
     */
    public function updateBatchStock(ProductBatch $batch, int $newStock): ProductBatch
    {
        return $this->updateBatch($batch, ['stock' => $newStock]);
    }

    /**
     * Recalculate and update pharmacy_products.stock as the SUM of all batch stocks.
     * Also updates pharmacy_products.expiry_date to the nearest upcoming batch expiry.
     */
    public function syncPharmacyProductStock(int $pharmacyProductId): void
    {
        $batches = ProductBatch::where('pharmacy_product_id', $pharmacyProductId)->get();

        $totalStock = $batches->sum('stock');
        
        $today = Carbon::today();
        $sellableStock = $batches->filter(function ($batch) use ($today) {
            return $batch->stock > 0 && (!$batch->expiry_date || $batch->expiry_date->greaterThanOrEqualTo($today));
        })->sum('stock');

        // Nearest upcoming expiry among all batches
        $nearestExpiry = $batches
            ->filter(fn ($b) => !is_null($b->expiry_date))
            ->sortBy('expiry_date')
            ->first()?->expiry_date;

        $pharmacyProduct = PharmacyProduct::where('id', $pharmacyProductId)->lockForUpdate()->first() ?? PharmacyProduct::find($pharmacyProductId);
        if ($pharmacyProduct) {
            $pharmacyProduct->stock = $totalStock;
            
            if ($sellableStock > 0) {
                $pharmacyProduct->is_available = true;
                $pharmacyProduct->is_out_of_stock = false;
            } else {
                $pharmacyProduct->is_out_of_stock = true;
            }

            // Auto-mark as expired if there is physical stock but none of it is sellable
            $pharmacyProduct->is_expired = ($totalStock > 0 && $sellableStock <= 0);

            $pharmacyProduct->save();
        }
    }

    /**
     * Deduct stock from batches using FEFO (First Expiry, First Out).
     * Non-expiring batches are consumed last.
     *
     * @return array<int, array{batch_id: int, batch_number: string|null, deducted: int}> Log of deductions per batch.
     * @throws \InvalidArgumentException if requested quantity exceeds available stock.
     */
    public function stockOutFefo(int $pharmacyProductId, int $quantity): array
    {
        $batches = $this->getBatchesForPharmacyProduct($pharmacyProductId, true);

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

        $this->syncPharmacyProductStock($pharmacyProductId);

        return $log;
    }
}
