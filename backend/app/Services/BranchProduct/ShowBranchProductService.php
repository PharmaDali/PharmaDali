<?php

namespace App\Services\BranchProduct;

use App\Models\BranchProduct;
use Illuminate\Database\Eloquent\Collection;

class ShowBranchProductService
{
    public function handle(int $branchId): Collection
    {
        return BranchProduct::query()
            ->with([
                'product:id,product_name,generic_name,brand_name,description,form,strength',
                'category:id,category_name,description',
            ])
            ->where('branch_id', $branchId)
            ->where('is_available', true)
            ->where('stock', '>', 0)
            ->orderBy('product_id')
            ->get();
    }
}
