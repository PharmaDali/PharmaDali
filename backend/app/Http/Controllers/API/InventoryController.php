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
        $pharmacyId = $request->user()->pharmacy_id;
        $metrics = $this->inventoryService->getInventoryMetrics($pharmacyId);

        return response()->json([
            'status' => 'success',
            'data' => $metrics,
        ]);
    }

    public function getTotalProductCount(Request $request)
    {
        $pharmacyId = $request->user()->pharmacy_id;
        $count = $this->inventoryService->getTotalProductCount($pharmacyId);

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_products' => $count,
            ],
        ]);
    }

    public function getInventoryProducts(Request $request)
    {
        $pharmacyId = $request->user()->pharmacy_id;
        $filters = $request->only(['search', 'category', 'price_range', 'stock_range', 'status']);
        $products = $this->inventoryService->getInventoryProducts($pharmacyId, $filters);

        return response()->json([
            'status' => 'success',
            'data' => $products,
        ]);
    }

    public function getInventoryLogs(Request $request)
    {
        $pharmacyId = $request->user()->pharmacy_id;
        $filters = $request->only(['search', 'action', 'date_range']);
        $logs = $this->inventoryService->getInventoryLogs($pharmacyId, $filters);

        return response()->json([
            'status' => 'success',
            'data' => $logs,
        ]);
    }
}
