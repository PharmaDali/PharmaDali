<?php

namespace App\Services\PharmacyProduct;

use App\Repositories\ProductRepository;
use App\Repositories\PharmacyProductRepository;
use App\Repositories\ProductBatchRepository;
use App\Models\Products;
use App\Models\Category;
use App\Models\PharmacyCategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class StorePharmacyProductService
{
    public function __construct(
        private readonly ProductRepository $productRepository,
        private readonly PharmacyProductRepository $pharmacyProductRepository,
        private readonly ProductBatchRepository $batchRepository,
    ) {}

    public function handle(array $validated, ?int $pharmacyId): Products
    {
        $idempotencyKey = $validated['idempotency_key'] ?? null;

        // Idempotency check: If idempotency_key is provided, return cached product if exists
        if ($idempotencyKey && $pharmacyId) {
            $cacheKey = "idempotency_product_{$pharmacyId}_{$idempotencyKey}";
            $cachedProductId = Cache::get($cacheKey);
            if ($cachedProductId) {
                $cachedProduct = $this->productRepository->find((int) $cachedProductId);
                if ($cachedProduct) {
                    return $cachedProduct;
                }
            }
        }

        // Concurrency lock to prevent concurrent double-submissions
        $lockKey = $idempotencyKey
            ? "lock_store_product_{$pharmacyId}_{$idempotencyKey}"
            : "lock_store_product_{$pharmacyId}_" . md5(($validated['product_name'] ?? '') . ($validated['brand_name'] ?? '') . ($validated['strength'] ?? ''));

        $lock = Cache::lock($lockKey, 10);

        return $lock->block(5, function () use ($validated, $pharmacyId, $idempotencyKey) {
            return DB::transaction(function () use ($validated, $pharmacyId, $idempotencyKey) {
                // Deduplication Guard: Check if identical product was created in the last 15 seconds
                if ($pharmacyId) {
                    $recentDuplicate = Products::where('pharmacy_id', $pharmacyId)
                        ->where('product_type', $validated['product_type'])
                        ->where('product_name', $validated['product_name'])
                        ->where('strength', $validated['strength'] ?? null)
                        ->where('form', $validated['form'] ?? null)
                        ->where('created_at', '>=', now()->subSeconds(15))
                        ->latest('id')
                        ->first();

                    if ($recentDuplicate) {
                        return $recentDuplicate;
                    }
                }

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
                            $categoryName = 'Generic';
                        }

                        if ($categoryName) {
                            $trimmedName = trim($categoryName);
                            $category = Category::whereRaw('LOWER(TRIM(category_name)) = ?', [strtolower($trimmedName)])->first();
                            if (!$category) {
                                $category = Category::create([
                                    'category_name' => $trimmedName,
                                    'is_enabled'    => true,
                                ]);
                            }
                            $categoryId = $category->id;
                        }
                    }

                    if (!$categoryId) {
                        $category = Category::whereRaw('LOWER(TRIM(category_name)) = ?', ['unclassified'])->first();
                        if (!$category) {
                            $category = Category::create([
                                'category_name' => 'Unclassified',
                                'is_enabled'    => true,
                            ]);
                        }
                        $categoryId = $category->id;
                    }

                    // Ensure pharmacy category link exists and is enabled
                    PharmacyCategory::firstOrCreate(
                        ['pharmacy_id' => $pharmacyId, 'category_id' => $categoryId],
                        ['is_enabled' => true]
                    );

                    $stock = $validated['stock'] ?? 0;
                    $expiryDate = $validated['expiry_date'] ?? null;

                    $this->pharmacyProductRepository->create([
                        'pharmacy_id'    => $pharmacyId,
                        'product_id'     => $product->id,
                        'category_id'    => $categoryId,
                        'stock'          => $stock,
                        'unit_cost'      => $validated['unit_cost'] ?? 0.00,
                        'selling_price'  => $validated['selling_price'] ?? 0.00,
                        'is_discountable'=> filter_var($validated['is_discountable'] ?? false, FILTER_VALIDATE_BOOLEAN),
                        'is_available'   => filter_var($validated['is_available'] ?? true, FILTER_VALIDATE_BOOLEAN),
                    ]);

                    // Create an initial product batch if stock or expiry info was provided
                    if ($stock > 0 || $expiryDate || !empty($validated['batch_number'])) {
                        $pharmacyProduct = $this->pharmacyProductRepository->findByPharmacyAndProduct($pharmacyId, $product->id);
                        if ($pharmacyProduct) {
                            $this->batchRepository->createBatch($pharmacyProduct->id, [
                                'batch_number'      => $validated['batch_number'] ?? null,
                                'supplier_name'     => $validated['supplier_name'] ?? null,
                                'stock'             => $stock,
                                'expiry_date'       => $expiryDate,
                                'manufactured_date' => $validated['manufactured_date'] ?? null,
                            ]);
                        }
                    }

                    // Remember in cache for idempotency
                    if ($idempotencyKey) {
                        Cache::put("idempotency_product_{$pharmacyId}_{$idempotencyKey}", $product->id, now()->addMinutes(10));
                    }
                }

                return $product;
            });
        });
    }
}
