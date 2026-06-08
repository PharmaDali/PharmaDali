<?php

namespace App\Services\Inventory;

use App\Models\BranchProduct;

class InventoryService
{
    public function getTotalProductCount($branchId)
    {
        return BranchProduct::where('branch_id', $branchId)->count();
    }
}