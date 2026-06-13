<?php

namespace App\Services\BranchProduct;

use App\Repositories\ProductRepository;

class DestroyBranchProductService
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
