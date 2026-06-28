<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\Inventory\InventoryService;
use App\Services\Inventory\RestockPredictorService;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventoryService,
        private readonly RestockPredictorService $restockService,
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

    public function getPriorityRestocks(Request $request)
    {
        $pharmacyId = $request->user()->pharmacy_id;

        if (!$pharmacyId) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Pharmacy context required.',
            ], 400);
        }

        $restocks = $this->restockService->getPriorityRestocks($pharmacyId);

        return response()->json([
            'status' => 'success',
            'data'   => $restocks,
        ]);
    }
}
