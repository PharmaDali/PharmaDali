<?php

namespace App\Services\Inventory;

use App\Models\BranchProduct;

class InventoryService
{
    public function getTotalProducts($branchId)
    {
        return BranchProduct::where('branch_id', $branchId)->count();
    }
}