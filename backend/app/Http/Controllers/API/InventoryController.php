<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Inventory\InventoryService;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventoryService,
    ) {}

    public function getTotalProducts(Request $request)
    {
        return $this->inventoryService->getTotalProducts($request->user()->branch_id);
    }
}
