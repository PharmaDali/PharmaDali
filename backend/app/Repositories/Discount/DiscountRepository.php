<?php

namespace App\Repositories\Discount;

use App\Models\Discount;
use Illuminate\Database\Eloquent\Collection;

class DiscountRepository
{
    public function getByPharmacy(int $pharmacyId): Collection
    {
        return Discount::where('pharmacy_id', $pharmacyId)
            ->orderBy('name', 'asc')
            ->get();
    }

    public function getActiveByPharmacy(int $pharmacyId): Collection
    {
        return Discount::where('pharmacy_id', $pharmacyId)
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();
    }

    public function findByIdAndPharmacy(int $id, int $pharmacyId): ?Discount
    {
        return Discount::where('id', $id)
            ->where('pharmacy_id', $pharmacyId)
            ->first();
    }

    public function create(array $data): Discount
    {
        return Discount::create($data);
    }

    public function update(Discount $discount, array $data): Discount
    {
        $discount->update($data);
        return $discount->fresh();
    }

    public function delete(Discount $discount): bool
    {
        return $discount->delete();
    }
}
