<?php

namespace App\Services\BranchProduct;

use App\Models\BranchProduct;
use Illuminate\Database\Eloquent\Collection;

class ShowBranchProductService
{
    public function handle(int $branchId, ?int $categoryId = null): Collection
    {
        $query = BranchProduct::query()
            ->with([
                'product:id,product_type,product_name,generic_name,brand_name,description,form,strength',
                'category:id,category_name,description',
            ])
            ->where('branch_id', $branchId)
            ->orderBy('product_id');

        if ($categoryId !== null) {
            $query->where('category_id', $categoryId);
        }

        return $query->get();
    }
}
