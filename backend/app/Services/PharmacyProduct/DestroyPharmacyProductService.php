<?php

namespace App\Services\PharmacyProduct;

use App\Repositories\ProductRepository;
use App\Models\PharmacyProduct;
use App\Services\Inventory\RestockPredictorService;
use Illuminate\Support\Facades\DB;

class DestroyPharmacyProductService
{
    public function __construct(
        private readonly ProductRepository $productRepository,
    ) {}

    public function handle(int $productId, ?int $pharmacyId = null): bool
    {
        return DB::transaction(function () use ($productId, $pharmacyId) {
            $product = $this->productRepository->find($productId);

            // Find all PharmacyProduct records for this product (scoped to pharmacy if provided)
            $pharmacyProductsQuery = PharmacyProduct::where('product_id', $productId);
            if ($pharmacyId) {
                $pharmacyProductsQuery->where('pharmacy_id', $pharmacyId);
            }
            $pharmacyProducts = $pharmacyProductsQuery->get();

            foreach ($pharmacyProducts as $pharmacyProduct) {
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
