<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PharmacyProduct;
use App\Models\ProductBatch;
use App\Services\Inventory\ProductBatchService;
use Illuminate\Http\Request;

class ProductBatchController extends Controller
{
    public function __construct(
        private readonly ProductBatchService $batchService,
    ) {}

    /**
     * List all batches for a given pharmacy_product.
     * GET /pharmacy/inventory/products/{pharmacyProductId}/batches
     */
    public function index(Request $request, int $pharmacyProductId)
    {
        $pharmacyProduct = PharmacyProduct::where('pharmacy_id', $request->user()->pharmacy_id)
            ->findOrFail($pharmacyProductId);

        $batches = $this->batchService->getBatchesForPharmacyProduct($pharmacyProduct->id);

        return response()->json([
            'status' => 'success',
            'data'   => $batches,
        ]);
    }

    /**
     * Add a new batch to an existing pharmacy_product.
     * POST /pharmacy/inventory/products/{pharmacyProductId}/batches
     */
    public function store(Request $request, int $pharmacyProductId)
    {
        $pharmacyProduct = PharmacyProduct::where('pharmacy_id', $request->user()->pharmacy_id)
            ->findOrFail($pharmacyProductId);

        $validated = $request->validate([
            'batch_number'      => 'nullable|string|max:100',
            'stock'             => 'required|integer|min:0',
            'expiry_date'       => 'nullable|date',
            'manufactured_date' => 'nullable|date',
        ]);

        $batch = $this->batchService->addBatch($pharmacyProduct, $validated);

        return response()->json([
            'status'  => 'success',
            'message' => 'Batch added successfully',
            'data'    => $batch,
        ], 201);
    }

    /**
     * Update a batch's stock directly (mid-level edit).
     * PATCH /pharmacy/inventory/batches/{batchId}
     */
    public function update(Request $request, int $batchId)
    {
        $batch = ProductBatch::findOrFail($batchId);

        $pharmacyProduct = PharmacyProduct::where('pharmacy_id', $request->user()->pharmacy_id)
            ->findOrFail($batch->pharmacy_product_id);

        $validated = $request->validate([
            'stock' => 'required|integer|min:0',
        ]);

        $updated = $this->batchService->updateBatchStock($pharmacyProduct, $batch, $validated['stock']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Batch stock updated successfully',
            'data'    => $updated,
        ]);
    }

    /**
     * Perform a FEFO stock-out deduction across batches.
     * POST /pharmacy/inventory/products/{pharmacyProductId}/stock-out
     */
    public function stockOut(Request $request, int $pharmacyProductId)
    {
        $pharmacyProduct = PharmacyProduct::where('pharmacy_id', $request->user()->pharmacy_id)
            ->findOrFail($pharmacyProductId);

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        try {
            $result = $this->batchService->stockOut($pharmacyProduct, $validated['quantity']);
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
