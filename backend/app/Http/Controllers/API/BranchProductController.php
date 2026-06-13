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
use App\Repositories\ProductBatchRepository;
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
    public function store(CreateBranchProductRequest $request, ProductBatchRepository $batchRepository)
    {
        Gate::authorize('create', Products::class);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($request, $batchRepository) {
            $validated = $request->validated();
            
            $productData = [
                'product_type' => $validated['product_type'],
                'product_name' => $validated['product_name'],
                'generic_name' => $validated['generic_name'] ?? null,
                'brand_name'   => $validated['brand_name'] ?? null,
                'description'  => $validated['description'] ?? null,
                'form'         => $validated['form'] ?? null,
                'strength'     => $validated['strength'] ?? null,
                'size'         => $validated['size'] ?? null,
                'is_prescribed'=> filter_var($validated['is_prescribed'] ?? false, FILTER_VALIDATE_BOOLEAN),
            ];
            
            $product = Products::create($productData);
            
            $user = $request->user();
            $branchId = $user ? $user->branch_id : null;
            
            if ($branchId) {
                $categoryId = $validated['category_id'] ?? null;
                if (!$categoryId) {
                    $categoryName = $validated['category_name'] ?? null;
                    if (!$categoryName && $validated['product_type'] === 'medicine') {
                        $categoryName = (!empty($validated['brand_name']) && strtolower($validated['brand_name']) !== strtolower($validated['generic_name'] ?? ''))
                            ? 'Branded'
                            : 'Generic';
                    }
                    
                    if ($categoryName) {
                        $category = \App\Models\Category::firstOrCreate([
                            'category_name' => $categoryName
                        ]);
                        $categoryId = $category->id;
                    }
                }
                
                if (!$categoryId) {
                    $category = \App\Models\Category::firstOrCreate([
                        'category_name' => 'Unclassified'
                    ]);
                    $categoryId = $category->id;
                }
                
                $stock = $validated['stock'] ?? 0;
                $expiryDate = $validated['expiry_date'] ?? null;
                
                $branchProduct = BranchProduct::create([
                    'branch_id'      => $branchId,
                    'product_id'     => $product->id,
                    'category_id'    => $categoryId,
                    'stock'          => $stock,
                    'selling_price'  => $validated['selling_price'] ?? 0.00,
                    'is_discountable'=> filter_var($validated['is_discountable'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    'is_available'   => true,
                    'expiry_date'    => $expiryDate,
                ]);

                // Create an initial product batch if stock or expiry info was provided
                if ($stock > 0 || $expiryDate || !empty($validated['batch_number'])) {
                    $batchRepository->createBatch($branchProduct->id, [
                        'batch_number'      => $validated['batch_number'] ?? null,
                        'stock'             => $stock,
                        'expiry_date'       => $expiryDate,
                        'manufactured_date' => $validated['manufactured_date'] ?? null,
                    ]);
                }
            }
            
            return response()->json([
                'status'  => 'success',
                'message' => 'Product created successfully',
                'data'    => $product
            ], 201);
        });
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

    public function update(UpdateBranchProductsRequest $request, string $id)
    {
        $product = Products::findOrFail($id);
        Gate::authorize('update', $product);

        $validated = $request->validated();

        // Separate Products fields from BranchProduct fields
        $productFields = array_intersect_key($validated, array_flip([
            'product_type', 'product_name', 'generic_name', 'brand_name', 'description', 'form', 'strength', 'size'
        ]));

        $product->update($productFields);

        // Update branch product if the user belongs to a branch
        $user = $request->user();
        $branchId = $user ? $user->branch_id : null;
        if ($branchId) {
            $branchProduct = BranchProduct::where('branch_id', $branchId)
                ->where('product_id', $product->id)
                ->first();

            if ($branchProduct) {
                $bpFields = [];
                if (isset($validated['selling_price'])) {
                    $bpFields['selling_price'] = $validated['selling_price'];
                }
                if (isset($validated['is_discountable'])) {
                    $bpFields['is_discountable'] = filter_var($validated['is_discountable'], FILTER_VALIDATE_BOOLEAN);
                }
                
                // Handle category update
                if (!empty($validated['category_name'])) {
                    $category = \App\Models\Category::firstOrCreate([
                        'category_name' => $validated['category_name']
                    ]);
                    $bpFields['category_id'] = $category->id;
                }

                if (!empty($bpFields)) {
                    $branchProduct->update($bpFields);
                }
            }
        }

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
