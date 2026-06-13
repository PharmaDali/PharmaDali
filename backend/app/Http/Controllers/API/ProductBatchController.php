<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BranchProduct;
use App\Models\ProductBatch;
use App\Services\Inventory\ProductBatchService;
use Illuminate\Http\Request;

class ProductBatchController extends Controller
{
    public function __construct(
        private readonly ProductBatchService $batchService,
    ) {}

    /**
     * List all batches for a given branch_product.
     * GET /branch/inventory/products/{branchProductId}/batches
     */
    public function index(Request $request, int $branchProductId)
    {
        $branchProduct = BranchProduct::where('branch_id', $request->user()->branch_id)
            ->findOrFail($branchProductId);

        $batches = $this->batchService->getBatchesForBranchProduct($branchProduct->id);

        return response()->json([
            'status' => 'success',
            'data'   => $batches,
        ]);
    }

    /**
     * Add a new batch to an existing branch_product.
     * POST /branch/inventory/products/{branchProductId}/batches
     */
    public function store(Request $request, int $branchProductId)
    {
        $branchProduct = BranchProduct::where('branch_id', $request->user()->branch_id)
            ->findOrFail($branchProductId);

        $validated = $request->validate([
            'batch_number'      => 'nullable|string|max:100',
            'stock'             => 'required|integer|min:0',
            'expiry_date'       => 'nullable|date',
            'manufactured_date' => 'nullable|date',
        ]);

        $batch = $this->batchService->addBatch($branchProduct, $validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Batch added successfully',
            'data'    => $batch,
        ], 201);
    }

    /**
     * Update a batch's stock directly (mid-level edit).
     * PATCH /branch/inventory/batches/{batchId}
     */
    public function update(Request $request, int $batchId)
    {
        $batch = ProductBatch::findOrFail($batchId);

        $branchProduct = BranchProduct::where('branch_id', $request->user()->branch_id)
            ->findOrFail($batch->branch_product_id);

        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $updated = $this->batchService->updateBatchStock($branchProduct, $batch, $validated['stock']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Batch stock updated successfully',
            'data'    => $updated,
        ]);
    }

    /**
     * Perform a FEFO stock-out deduction across batches.
     * POST /branch/inventory/products/{branchProductId}/stock-out
     */
    public function stockOut(Request $request, int $branchProductId)
    {
        $branchProduct = BranchProduct::where('branch_id', $request->user()->branch_id)
            ->findOrFail($branchProductId);

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        try {
            $result = $this->batchService->stockOut($branchProduct, $validated['quantity']);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'status'          => 'success',
            'message'         => "Stock out of {$validated['quantity']} unit(s) applied via FEFO.",
            'deductions'      => $result['deductions'],
            'remaining_stock' => $result['remaining_stock'],
            'batches'         => $result['batches'],
        ]);
    }
}
