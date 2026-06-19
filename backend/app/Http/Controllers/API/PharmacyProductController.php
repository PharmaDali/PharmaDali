<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportPharmacyProductsRequest;
use App\Imports\PharmacyProductsImport;
use App\Models\Products;
use App\Models\PharmacyProduct;
use App\Http\Requests\CreatePharmacyProductRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Http\Requests\UpdatePharmacyProductsRequest;
use App\Http\Requests\ShowPharmacyProductRequest;
use App\Services\PharmacyProduct\ShowPharmacyProductService;
use App\Services\PharmacyProduct\ShowPharmacyCategoriesService;
use App\Services\PharmacyProduct\SearchPharmacyProductService;
use App\Services\PharmacyProduct\StorePharmacyProductService;
use App\Services\PharmacyProduct\UpdatePharmacyProductService;
use App\Services\PharmacyProduct\DestroyPharmacyProductService;
use App\Repositories\ProductRepository;
use App\Repositories\PharmacyProductRepository;
use Maatwebsite\Excel\Facades\Excel;

class PharmacyProductController extends Controller
{
    public function __construct(
        private readonly ProductRepository $productRepository,
        private readonly PharmacyProductRepository $pharmacyProductRepository,
        private readonly StorePharmacyProductService $storeService,
        private readonly UpdatePharmacyProductService $updateService,
        private readonly DestroyPharmacyProductService $destroyService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $products = $this->productRepository->all();
        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreatePharmacyProductRequest $request)
    {
        Gate::authorize('create', Products::class);

        $user = $request->user();
        $pharmacyId = $user ? $user->pharmacy_id : null;

        $product = $this->storeService->handle($request->validated(), $pharmacyId);

        return response()->json([
            'status'  => 'success',
            'message' => 'Product created successfully',
            'data'    => $product
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $product = $this->productRepository->find((int) $id);
        return response()->json([
            'status' => 'success',
            'data' => $product
        ]);
    }

    /**
     * Display a specific pharmacy product.
     */
    public function showSinglePharmacyProduct(int $pharmacyId, int $pharmacyProductId)
    {
        $pharmacyProduct = $this->pharmacyProductRepository->getSinglePharmacyProduct($pharmacyId, $pharmacyProductId);

        return response()->json([
            'status' => 'success',
            'data' => $pharmacyProduct
        ]);
    }

    /**
     * Display pharmacy-specific products for customer purchasing flow.
     */
    public function showPharmacyProducts(
        ShowPharmacyProductRequest $request,
        ShowPharmacyProductService $showPharmacyProductService,
        SearchPharmacyProductService $searchPharmacyProductService
    ) {
        $validated = $request->validated();

        if ($request->has('query') && !empty($validated['query'])) {
            $paginator = $searchPharmacyProductService->handle(
                pharmacyId: (int) $validated['pharmacy_id'],
                query: $validated['query'],
                perPage: (int) ($validated['per_page'] ?? 20),
                cursor: $validated['cursor'] ?? null,
            );
        } else {
            $paginator = $showPharmacyProductService->handle(
                pharmacyId: (int) $validated['pharmacy_id'],
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
     * Display pharmacy-specific categories available for purchasing flow.
     */
    public function showPharmacyCategories(
        ShowPharmacyProductRequest $request,
        ShowPharmacyCategoriesService $showPharmacyCategoriesService
    ) {
        $validated = $request->validated();
        $forceRefresh = $request->boolean('force_refresh');
        $categories = $showPharmacyCategoriesService->handle((int) $validated['pharmacy_id'], $forceRefresh);

        return response()->json([
            'status' => 'success',
            'data' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePharmacyProductsRequest $request, string $id)
    {
        $user = $request->user();
        $pharmacyId = $user ? $user->pharmacy_id : null;

        $product = $this->productRepository->find((int) $id);
        Gate::authorize('update', $product);

        $updatedProduct = $this->updateService->handle((int) $id, $request->validated(), $pharmacyId);

        return response()->json([
            'status' => 'success',
            'message' => 'Product updated successfully',
            'data' => $updatedProduct
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $product = $this->productRepository->find((int) $id);
        Gate::authorize('delete', $product);

        $this->destroyService->handle((int) $id);

        return response()->json([
            'status' => 'success',
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Import pharmacy products from an uploaded XLSX/CSV file.
     */
    public function importPharmacyProducts(ImportPharmacyProductsRequest $request)
    {
        Gate::authorize('create', Products::class);

        $pharmacyId = $request->input('pharmacy_id') ?? $request->user()?->pharmacy_id;

        if (!$pharmacyId) {
            return response()->json([
                'status' => 'error',
                'message' => 'pharmacy_id is required when the user has no pharmacy assigned.'
            ], 422);
        }

        $import = new PharmacyProductsImport((int) $pharmacyId);
        Excel::import($import, $request->file('file'));

        return response()->json([
            'status' => 'success',
            'message' => 'Pharmacy products imported successfully',
            'summary' => $import->summary(),
        ]);
    }
}
