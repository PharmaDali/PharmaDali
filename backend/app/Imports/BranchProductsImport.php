<?php

namespace App\Imports;

use App\Models\BranchProduct;
use App\Models\Category;
use App\Models\Products;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\DB;

class BranchProductsImport implements ToCollection, WithHeadingRow
{
    private int $branchId;
    private int $createdProducts = 0;
    private int $createdBranchProducts = 0;
    private int $updatedBranchProducts = 0;

    public function __construct(int $branchId)
    {
        $this->branchId = $branchId;
    }

    public function collection(Collection $rows)
    {
        DB::transaction(function () use ($rows) {
            foreach ($rows as $row) {
                $rowData = $row instanceof Collection ? $row->toArray() : (array) $row;

                $categoryName = trim((string) ($rowData['category_name'] ?? ''));
                $productName = trim((string) ($rowData['product_name'] ?? ''));

                if ($categoryName === '' || $productName === '') {
                    continue;
                }

                $size = trim((string) ($rowData['size'] ?? ''));
                $strength = trim((string) ($rowData['strength'] ?? ''));
                $form = trim((string) ($rowData['form'] ?? ''));

                $price = (float) ($rowData['selling_price'] ?? ($rowData['price'] ?? 0));
                $isDiscountable = $this->toBool($rowData['is_discountable'] ?? ($rowData['discountable'] ?? false));

                $category = Category::firstOrCreate(
                    ['category_name' => $categoryName],
                    ['description' => null]
                );

                $categoryUpper = strtoupper($categoryName);
                $isGenericCategory = $categoryUpper === 'GENERIC';
                $isBrandedCategory = $categoryUpper === 'BRANDED';

                $hasGenericColumn = array_key_exists('generic_name', $rowData);
                $hasBrandColumn = array_key_exists('brand_name', $rowData);

                $genericNameInput = trim((string) ($rowData['generic_name'] ?? ''));
                $brandNameInput = trim((string) ($rowData['brand_name'] ?? ''));

                $genericName = $genericNameInput !== '' ? $genericNameInput : null;
                $brandName = $brandNameInput !== '' ? $brandNameInput : null;

                if ($genericName === null && $brandName === null && ($hasGenericColumn || $hasBrandColumn)) {
                    $nameParts = $this->splitGenericBrand($productName);

                    if ($nameParts !== null) {
                        $genericName = $nameParts['generic_name'];
                        $brandName = $nameParts['brand_name'];
                    } elseif ($isGenericCategory) {
                        $genericName = $productName;
                    } elseif ($isBrandedCategory) {
                        $brandName = $productName;
                    }
                }

                $productType = ($strength !== '' || $form !== '' || $isGenericCategory || $isBrandedCategory)
                    ? 'medicine'
                    : 'non_medicine';

                $product = Products::firstOrCreate(
                    [
                        'product_name' => $productName,
                        'strength' => $strength !== '' ? $strength : null,
                        'form' => $form !== '' ? $form : null,
                        'size' => $size !== '' ? $size : null,
                    ],
                    [
                        'product_type' => $productType,
                        'generic_name' => $genericName,
                        'brand_name' => $brandName,
                        'description' => null,
                        'is_prescribed' => false,
                    ]
                );

                if ($product->wasRecentlyCreated) {
                    $this->createdProducts++;
                }

                $branchProduct = BranchProduct::updateOrCreate(
                    [
                        'branch_id' => $this->branchId,
                        'product_id' => $product->id,
                    ],
                    [
                        'category_id' => $category->id,
                        'selling_price' => $price,
                        'is_discountable' => $isDiscountable,
                        'is_available' => true,
                    ]
                );

                if ($branchProduct->wasRecentlyCreated) {
                    $this->createdBranchProducts++;
                } else {
                    $this->updatedBranchProducts++;
                }
            }
        });
    }

    public function summary(): array
    {
        return [
            'created_products' => $this->createdProducts,
            'created_branch_products' => $this->createdBranchProducts,
            'updated_branch_products' => $this->updatedBranchProducts,
        ];
    }

    private function toBool(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        $value = strtolower(trim((string) $value));

        return in_array($value, ['1', 'true', 'yes', 'y'], true);
    }

    private function splitGenericBrand(string $productName): ?array
    {
        $name = trim($productName);

        if ($name === '') {
            return null;
        }

        if (str_contains($name, '(') && str_contains($name, ')')) {
            $before = trim(preg_replace('/\s*\(.*\)\s*/', '', $name) ?? '');
            preg_match('/\(([^)]+)\)/', $name, $matches);
            $inside = isset($matches[1]) ? trim($matches[1]) : '';

            if ($before !== '' && $inside !== '') {
                return [
                    'generic_name' => $before,
                    'brand_name' => $inside,
                ];
            }
        }

        foreach ([' / ', '/', ' - ', '-'] as $separator) {
            if (!str_contains($name, $separator)) {
                continue;
            }

            $parts = array_map('trim', explode($separator, $name, 2));

            if (count($parts) === 2 && $parts[0] !== '' && $parts[1] !== '') {
                return [
                    'generic_name' => $parts[0],
                    'brand_name' => $parts[1],
                ];
            }
        }

        return null;
    }
}
