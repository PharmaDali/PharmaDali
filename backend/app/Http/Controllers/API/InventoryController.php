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
        $metrics = $this->inventoryService->getInventoryMetrics();

        return response()->json([
            'status' => 'success',
            'data' => $metrics,
        ]);
    }

    public function getTotalProductCount(Request $request)
    {
        $count = $this->inventoryService->getTotalProductCount();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_products' => $count,
            ],
        ]);
    }

    public function getInventoryProducts(Request $request)
    {
        $filters = $request->only(['search', 'category', 'price_range', 'stock_range', 'status']);
        $products = $this->inventoryService->getInventoryProducts($filters);

        return response()->json([
            'status' => 'success',
            'data' => $products,
        ]);
    }

    public function getInventoryLogs(Request $request)
    {
        $filters = $request->only(['search', 'action', 'date_range']);
        $logs = $this->inventoryService->getInventoryLogs($filters);

        return response()->json([
            'status' => 'success',
            'data' => $logs,
        ]);
    }
}
