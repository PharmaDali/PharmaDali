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

    public function getInventoryMetrics(Request $request)
    {
        $branchId = $request->user()->branch_id;
        $metrics = $this->inventoryService->getInventoryMetrics($branchId);

        return response()->json([
            'status' => 'success',
            'data' => $metrics,
        ]);
    }

    public function getInventoryProducts(Request $request)
    {
        $branchId = $request->user()->branch_id;
        $filters = $request->only(['search', 'category', 'price_range', 'stock_range', 'status']);
        $products = $this->inventoryService->getInventoryProducts($branchId, $filters);

        return response()->json([
            'status' => 'success',
            'data' => $products,
        ]);
    }

    public function getInventoryLogs(Request $request)
    {
        $branchId = $request->user()->branch_id;
        $filters = $request->only(['search', 'action', 'date_range']);
        $logs = $this->inventoryService->getInventoryLogs($branchId, $filters);

        return response()->json([
            'status' => 'success',
            'data' => $logs,
        ]);
    }
}
