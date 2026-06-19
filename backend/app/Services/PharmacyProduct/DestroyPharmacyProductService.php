<?php

namespace App\Services\PharmacyProduct;

use App\Repositories\ProductRepository;

class DestroyPharmacyProductService
{
    public function __construct(
        private readonly ProductRepository $productRepository,
    ) {}

    public function handle(int $productId): bool
    {
        $product = $this->productRepository->find($productId);
        return $this->productRepository->delete($product);
    }
}
