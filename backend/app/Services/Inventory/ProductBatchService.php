<?php

namespace App\Services\Inventory;

use App\Models\PharmacyProduct;
use App\Models\ProductBatch;
use App\Repositories\ProductBatchRepository;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class ProductBatchService
{
    public function __construct(
        private readonly ProductBatchRepository $batchRepository,
        private readonly InventoryLogService $logService,
    ) {}

    /**
     * Get all batches for a pharmacy product with computed status fields.
     */
    public function getBatchesForPharmacyProduct(int $pharmacyProductId): Collection
    {
        $today   = Carbon::today();
        $batches = $this->batchRepository->getBatchesForPharmacyProduct($pharmacyProductId);

        return $batches->map(fn ($batch) => $this->formatBatch($batch, $today));
    }

    /**
     * Add a new batch to a pharmacy product.
     */
    public function addBatch(PharmacyProduct $pharmacyProduct, array $data): array
    {
        $batch = $this->batchRepository->createBatch($pharmacyProduct->id, $data);

        $this->logService->logStockIn(
            pharmacyId:          $pharmacyProduct->pharmacy_id,
            pharmacyProductId:   $pharmacyProduct->id,
            batchId:             $batch->id,
            quantity:            (int) $batch->stock,
            reason:              'New batch received' . ($batch->batch_number ? ': #' . $batch->batch_number : ''),
        );

        return $this->formatBatch($batch, Carbon::today());
    }

    /**
     * Update a batch's stock directly (mid-level approach).
     */
    public function updateBatchStock(PharmacyProduct $pharmacyProduct, ProductBatch $batch, int $newStock): array
    {
        $oldStock = (int) $batch->stock;
        $updated  = $this->batchRepository->updateBatchStock($batch, $newStock);

        $this->logService->logAdjustment(
            pharmacyId:          $pharmacyProduct->pharmacy_id,
            pharmacyProductId:   $pharmacyProduct->id,
            batchId:             $batch->id,
            oldStock:            $oldStock,
            newStock:            (int) $updated->stock,
        );

        return $this->formatBatch($updated, Carbon::today());
    }

    /**
     * Perform a FEFO stock-out across batches.
     *
     * @return array{
     *   deductions: array<int, array{batch_id: int, batch_number: string|null, deducted: int}>,
     *   remaining_stock: int,
     *   batches: Collection
     * }
     * @throws \InvalidArgumentException if quantity exceeds available stock.
     */
    public function stockOut(PharmacyProduct $pharmacyProduct, int $quantity): array
    {
        $deductions = $this->batchRepository->stockOutFefo($pharmacyProduct->id, $quantity);

        foreach ($deductions as $deduction) {
            $this->logService->logStockOut(
                pharmacyId:          $pharmacyProduct->pharmacy_id,
                pharmacyProductId:   $pharmacyProduct->id,
                batchId:             $deduction['batch_id'],
                quantity:            $deduction['deducted'],
                reason:              'Manual stock-out deduction',
            );
        }

        $today          = Carbon::today();
        $updatedBatches = $this->batchRepository
            ->getBatchesForPharmacyProduct($pharmacyProduct->id)
            ->map(fn ($b) => $this->formatBatch($b, $today));

        $pharmacyProduct->refresh();

        return [
            'deductions'      => $deductions,
            'remaining_stock' => $pharmacyProduct->stock,
            'batches'         => $updatedBatches,
        ];
    }

    /**
     * Format a single batch model into the API response shape.
     */
    private function formatBatch(ProductBatch $batch, Carbon $today): array
    {
        $expiringInDays = null;
        $status         = 'Normal';

        if ($batch->expiry_date) {
            $expiringInDays = (int) $today->diffInDays($batch->expiry_date, false);

            if ($expiringInDays <= 0) {
                $status = 'Expired';
            } elseif ($expiringInDays <= 30) {
                $status = 'Expiring soon';
            }
        }

        $expiryDate = $batch->expiry_date;
        $manufacturedDate = $batch->manufactured_date;
        $receivedAt = $batch->received_at;

        return [
            'id'                => $batch->id,
            'batch_number'      => $batch->batch_number,
            'stock'             => $batch->stock,
            'expiry_date'       => $expiryDate instanceof Carbon ? $expiryDate->toDateString() : null,
            'manufactured_date' => $manufacturedDate instanceof Carbon ? $manufacturedDate->toDateString() : null,
            'received_at'       => $receivedAt instanceof Carbon ? $receivedAt->toDateTimeString() : null,
            'expiring_in_days'  => $expiringInDays,
            'status'            => $status,
        ];
    }
}
