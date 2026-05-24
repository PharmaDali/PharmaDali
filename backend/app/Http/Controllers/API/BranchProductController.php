<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportBranchProductsRequest;
use App\Imports\BranchProductsImport;
use App\Models\Products;
use App\Models\BranchProduct;
use App\Http\Requests\CreateBranchProductRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Http\Requests\UpdateBranchProductsRequest;
use App\Http\Requests\ShowBranchProductRequest;
use App\Services\BranchProduct\ShowBranchProductService;
use App\Services\BranchProduct\ShowBranchCategoriesService;
use App\Services\BranchProduct\SearchBranchProductService;
use Maatwebsite\Excel\Facades\Excel;

class BranchProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = Products::all();
        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateBranchProductRequest $request)
    {
        Gate::authorize('create', Products::class);

        $product = Products::create($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Product created successfully',
            'data' => $product
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = Products::findOrFail($id);
        return response()->json([
            'status' => 'success',
            'data' => $product
        ]);
    }

    /**
     * Display a specific branch product.
     */
    public function showSingleBranchProduct(int $branchId, int $branchProductId)
    {
        $branchProduct = BranchProduct::with([
            'product',
            'category'
        ])
            ->where('branch_id', $branchId)
            ->where('id', $branchProductId)
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'data' => $branchProduct
        ]);
    }

    /**
     * Display branch-specific products for customer purchasing flow.
     */
    public function showBranchProducts(ShowBranchProductRequest $request, ShowBranchProductService $showBranchProductService, SearchBranchProductService $searchBranchProductService)
    {
        $validated = $request->validated();

        if ($request->has('query') && !empty($validated['query'])) {
            $paginator = $searchBranchProductService->handle(
                branchId: (int) $validated['branch_id'],
                query: $validated['query'],
                perPage: (int) ($validated['per_page'] ?? 20),
                cursor: $validated['cursor'] ?? null,
            );
        } else {
            $paginator = $showBranchProductService->handle(
                branchId: (int) $validated['branch_id'],
                categoryId: isset($validated['category_id']) ? (int) $validated['category_id'] : null,
                perPage: (int) ($validated['per_page'] ?? 20),
                cursor: $validated['cursor'] ?? null,
            );
        }

        return response()->json([
            'status' => 'success',
            'data' => $paginator->items(),
            'next_cursor' => $paginator->nextCursor()?->encode(),
            'has_more' => $paginator->hasMorePages(),
        ]);
    }

    /**
     * Display branch-specific categories available for purchasing flow.
     */
    public function showBranchCategories(ShowBranchProductRequest $request, ShowBranchCategoriesService $showBranchCategoriesService)
    {
        $validated = $request->validated();
        $forceRefresh = $request->boolean('force_refresh');
        $categories = $showBranchCategoriesService->handle((int) $validated['branch_id'], $forceRefresh);

        return response()->json([
            'status' => 'success',
            'data' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBranchProductsRequest $request, string $id)
    {
        $product = Products::findOrFail($id);
        Gate::authorize('update', $product);

        $validated = $request->validated();

        $product->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Product updated successfully',
            'data' => $product
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product = Products::findOrFail($id);
        Gate::authorize('delete', $product);

        $product->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Import branch products from an uploaded XLSX/CSV file.
     */
    public function importBranchProducts(ImportBranchProductsRequest $request)
    {
        Gate::authorize('create', Products::class);

        $branchId = $request->input('branch_id') ?? $request->user()?->branch_id;

        if (!$branchId) {
            return response()->json([
                'status' => 'error',
                'message' => 'branch_id is required when the user has no branch assigned.'
            ], 422);
        }

        $import = new BranchProductsImport((int) $branchId);
        Excel::import($import, $request->file('file'));

        return response()->json([
            'status' => 'success',
            'message' => 'Branch products imported successfully',
            'summary' => $import->summary(),
        ]);
    }
}
