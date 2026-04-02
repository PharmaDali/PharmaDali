<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Products;
use App\Http\Requests\CreateBranchProductRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Http\Requests\UpdateBranchProductsRequest;
use App\Http\Requests\ShowBranchProductRequest;
use App\Services\BranchProduct\ShowBranchProductService;
use App\Services\BranchProduct\ShowBranchCategoriesService;

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
     * Display branch-specific products for customer purchasing flow.
     */
    public function showBranchProducts(ShowBranchProductRequest $request, ShowBranchProductService $showBranchProductService)
    {
        $validated = $request->validated();
        $forceRefresh = $request->boolean('force_refresh');

        $branchProducts = $showBranchProductService->handle(
            (int) $validated['branch_id'],
            isset($validated['category_id']) ? (int) $validated['category_id'] : null,
            $forceRefresh,
        );

        return response()->json([
            'status' => 'success',
            'data' => $branchProducts,
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
}
