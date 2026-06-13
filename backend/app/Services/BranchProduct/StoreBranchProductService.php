<?php

namespace App\Services\BranchProduct;

use App\Repositories\ProductRepository;
use App\Repositories\BranchProductRepository;
use App\Repositories\ProductBatchRepository;
use App\Models\Products;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class StoreBranchProductService
{
    public function __construct(
        private readonly ProductRepository $productRepository,
        private readonly BranchProductRepository $branchProductRepository,
        private readonly ProductBatchRepository $batchRepository,
    ) {}

    public function handle(array $validated, ?int $branchId): Products
    {
        return DB::transaction(function () use ($validated, $branchId) {
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

            $product = $this->productRepository->create($productData);

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
                        $category = Category::firstOrCreate([
                            'category_name' => $categoryName
                        ]);
                        $categoryId = $category->id;
                    }
                }

                if (!$categoryId) {
                    $category = Category::firstOrCreate([
                        'category_name' => 'Unclassified'
                    ]);
                    $categoryId = $category->id;
                }

                $stock = $validated['stock'] ?? 0;
                $expiryDate = $validated['expiry_date'] ?? null;

                $this->branchProductRepository->create([
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
                    $branchProduct = $this->branchProductRepository->findByBranchAndProduct($branchId, $product->id);
                    if ($branchProduct) {
                        $this->batchRepository->createBatch($branchProduct->id, [
                            'batch_number'      => $validated['batch_number'] ?? null,
                            'stock'             => $stock,
                            'expiry_date'       => $expiryDate,
                            'manufactured_date' => $validated['manufactured_date'] ?? null,
                        ]);
                    }
                }
            }

            return $product;
        });
    }
}
