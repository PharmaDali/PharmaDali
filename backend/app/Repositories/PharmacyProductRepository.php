<?php

namespace App\Repositories;

use App\Models\PharmacyProduct;

class PharmacyProductRepository
{
    public function create(array $data): PharmacyProduct
    {
        return PharmacyProduct::create($data);
    }

    public function findByPharmacyAndProduct(int $pharmacyId, int $productId): ?PharmacyProduct
    {
        return PharmacyProduct::where('pharmacy_id', $pharmacyId)
            ->where('product_id', $productId)
            ->first();
    }

    public function update(PharmacyProduct $pharmacyProduct, array $data): PharmacyProduct
    {
        $pharmacyProduct->update($data);
        return $pharmacyProduct;
    }

    public function getSinglePharmacyProduct(int $pharmacyId, int $pharmacyProductId): PharmacyProduct
    {
        return PharmacyProduct::with(['product', 'category'])
            ->where('pharmacy_id', $pharmacyId)
            ->where('id', $pharmacyProductId)
            ->firstOrFail();
    }
}
