<?php

namespace App\Services\PharmacyProduct;

use App\Repositories\ProductRepository;
use App\Repositories\PharmacyProductRepository;
use App\Repositories\ProductBatchRepository;
use App\Models\Products;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class StorePharmacyProductService
{
    public function __construct(
        private readonly ProductRepository $productRepository,
        private readonly PharmacyProductRepository $pharmacyProductRepository,
        private readonly ProductBatchRepository $batchRepository,
    ) {}

    public function handle(array $validated, ?int $pharmacyId): Products
    {
        return DB::transaction(function () use ($validated, $pharmacyId) {
            $productData = [
                'pharmacy_id'  => $pharmacyId,
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

            if ($pharmacyId) {
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

                $this->pharmacyProductRepository->create([
                    'pharmacy_id'    => $pharmacyId,
                    'product_id'     => $product->id,
                    'category_id'    => $categoryId,
                    'stock'          => $stock,
                    'selling_price'  => $validated['selling_price'] ?? 0.00,
                    'is_discountable'=> filter_var($validated['is_discountable'] ?? false, FILTER_VALIDATE_BOOLEAN),
                    'is_available'   => true,
                ]);

                // Create an initial product batch if stock or expiry info was provided
                if ($stock > 0 || $expiryDate || !empty($validated['batch_number'])) {
                    $pharmacyProduct = $this->pharmacyProductRepository->findByPharmacyAndProduct($pharmacyId, $product->id);
                    if ($pharmacyProduct) {
                        $this->batchRepository->createBatch($pharmacyProduct->id, [
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
