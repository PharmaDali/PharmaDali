<?php

namespace App\Services\PharmacyProduct;

use App\Repositories\ProductRepository;
use App\Models\PharmacyProduct;
use App\Services\Inventory\InventoryLogService;
use App\Services\Inventory\RestockPredictorService;
use Illuminate\Support\Facades\DB;

class DestroyPharmacyProductService
{
    public function __construct(
        private readonly ProductRepository $productRepository,
        private readonly InventoryLogService $logService,
    ) {}

    public function handle(int $productId, ?int $pharmacyId = null): bool
    {
        return DB::transaction(function () use ($productId, $pharmacyId) {
            $product = $this->productRepository->find($productId);

            // Find all PharmacyProduct records for this product (scoped to pharmacy if provided)
            $pharmacyProductsQuery = PharmacyProduct::with(['product', 'batches'])->where('product_id', $productId);
            if ($pharmacyId) {
                $pharmacyProductsQuery->where('pharmacy_id', $pharmacyId);
            }
            $pharmacyProducts = $pharmacyProductsQuery->get();

            foreach ($pharmacyProducts as $pharmacyProduct) {
                $totalStock = (int) ($pharmacyProduct->batches->count() > 0 
                    ? $pharmacyProduct->batches->sum('stock') 
                    : $pharmacyProduct->stock);

                $productModel = $pharmacyProduct->product ?? $product;
                $nameParts = array_filter([
                    $productModel?->product_name,
                    ($productModel?->strength && !in_array(strtolower(trim($productModel->strength)), ['n/a', 'na', 'n.a', 'n.a.'])) ? trim($productModel->strength) : null,
                    ($productModel?->size && !in_array(strtolower(trim($productModel->size)), ['n/a', 'na', 'n.a', 'n.a.'])) ? trim($productModel->size) : null,
                ]);
                $fullName = implode(' ', $nameParts) ?: ($productModel?->product_name ?? 'Unknown Product');

                // Record audit trail for deleted product
                try {
                    $this->logService->logProductDeleted(
                        pharmacyId: $pharmacyProduct->pharmacy_id,
                        pharmacyProductId: $pharmacyProduct->id,
                        productName: $fullName,
                        quantity: $totalStock,
                        unitCost: $pharmacyProduct->unit_cost ? (float) $pharmacyProduct->unit_cost : null,
                        sellingPrice: $pharmacyProduct->selling_price ? (float) $pharmacyProduct->selling_price : null,
                        reason: "Product permanently deleted from inventory (" . ($totalStock > 0 ? "{$totalStock} batch units removed" : "0 units in stock") . ")"
                    );
                } catch (\Throwable $e) {
                }

                // Explicitly delete all batch stocks associated with this pharmacy product
                $pharmacyProduct->batches()->delete();
                $pharmacyProduct->delete();
            }

            // If this product was created by this pharmacy or is no longer referenced anywhere else
            $remainingLinks = PharmacyProduct::where('product_id', $productId)->count();
            if ($remainingLinks === 0 || ($pharmacyId && $product->pharmacy_id === $pharmacyId)) {
                $this->productRepository->delete($product);
            }

            // Invalidate priority restocks cache
            if ($pharmacyId) {
                try {
                    app(RestockPredictorService::class)->clearPriorityRestocksCache($pharmacyId);
                } catch (\Throwable $e) {
                    // Ignore cache clearance error if service unavailable
                }
            }

            return true;
        });
    }
}
