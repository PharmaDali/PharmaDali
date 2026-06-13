<?php

namespace App\Services\BranchProduct;

use App\Repositories\ProductRepository;
use App\Repositories\BranchProductRepository;
use App\Models\Products;
use App\Models\Category;

class UpdateBranchProductService
{
    public function __construct(
        private readonly ProductRepository $productRepository,
        private readonly BranchProductRepository $branchProductRepository,
    ) {}

    public function handle(int $productId, array $validated, ?int $branchId): Products
    {
        $product = $this->productRepository->find($productId);

        // Separate Products fields from BranchProduct fields
        $productFields = array_intersect_key($validated, array_flip([
            'product_type', 'product_name', 'generic_name', 'brand_name', 'description', 'form', 'strength', 'size'
        ]));

        $this->productRepository->update($product, $productFields);

        // Update branch product if the user belongs to a branch
        if ($branchId) {
            $branchProduct = $this->branchProductRepository->findByBranchAndProduct($branchId, $product->id);

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
                    $category = Category::firstOrCreate([
                        'category_name' => $validated['category_name']
                    ]);
                    $bpFields['category_id'] = $category->id;
                }

                if (!empty($bpFields)) {
                    $this->branchProductRepository->update($branchProduct, $bpFields);
                }
            }
        }

        return $product;
    }
}
