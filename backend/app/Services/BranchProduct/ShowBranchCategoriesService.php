<?php

namespace App\Services\BranchProduct;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class ShowBranchCategoriesService
{
    public function handle(int $branchId): Collection
    {
        return Category::query()
            ->select('categories.id', 'categories.category_name', 'categories.description')
            ->selectRaw('COUNT(branch_products.id) as product_count')
            ->join('branch_products', 'branch_products.category_id', '=', 'categories.id')
            ->where('branch_products.branch_id', $branchId)
            ->groupBy('categories.id', 'categories.category_name', 'categories.description')
            ->orderBy('categories.category_name')
            ->get();
    }
}
