<?php

namespace App\Repositories;

use App\Models\BranchProduct;

class BranchProductRepository
{
    public function create(array $data): BranchProduct
    {
        return BranchProduct::create($data);
    }

    public function findByBranchAndProduct(int $branchId, int $productId): ?BranchProduct
    {
        return BranchProduct::where('branch_id', $branchId)
            ->where('product_id', $productId)
            ->first();
    }

    public function update(BranchProduct $branchProduct, array $data): BranchProduct
    {
        $branchProduct->update($data);
        return $branchProduct;
    }

    public function getSingleBranchProduct(int $branchId, int $branchProductId): BranchProduct
    {
        return BranchProduct::with(['product', 'category'])
            ->where('branch_id', $branchId)
            ->where('id', $branchProductId)
            ->firstOrFail();
    }
}
