<?php

namespace App\Services\PharmacyProduct;

use App\Repositories\ProductRepository;
use App\Repositories\PharmacyProductRepository;
use App\Models\Products;
use App\Models\Category;

class UpdatePharmacyProductService
{
    public function __construct(
        private readonly ProductRepository $productRepository,
        private readonly PharmacyProductRepository $pharmacyProductRepository,
    ) {}

    public function handle(int $productId, array $validated, ?int $pharmacyId): Products
    {
        $product = $this->productRepository->find($productId);

        // Separate Products fields from PharmacyProduct fields
        $productFields = array_intersect_key($validated, array_flip([
            'product_type', 'product_name', 'generic_name', 'brand_name', 'description', 'form', 'strength', 'size'
        ]));
        
        file_put_contents(storage_path('logs/debug_update.txt'), json_encode([
            'validated' => $validated,
            'productFields' => $productFields,
            'productId' => $productId,
            'pharmacyId' => $pharmacyId
        ]) . PHP_EOL, FILE_APPEND);

        $this->productRepository->update($product, $productFields);

        // Update pharmacy product if the user belongs to a pharmacy
        if ($pharmacyId) {
            $pharmacyProduct = $this->pharmacyProductRepository->findByPharmacyAndProduct($pharmacyId, $product->id);

            if ($pharmacyProduct) {
                $bpFields = [];
                if (isset($validated['selling_price'])) {
                    $bpFields['selling_price'] = $validated['selling_price'];
                }
                if (isset($validated['is_discountable'])) {
                    $bpFields['is_discountable'] = filter_var($validated['is_discountable'], FILTER_VALIDATE_BOOLEAN);
                }

                // Handle category update
                if (!empty($validated['category_name'])) {
                    $category = Category::firstOrCreate([
                        'category_name' => $validated['category_name']
                    ]);
                    $bpFields['category_id'] = $category->id;
                }

                if (!empty($bpFields)) {
                    $this->pharmacyProductRepository->update($pharmacyProduct, $bpFields);
                }
            }
        }

        return $product;
    }
}
