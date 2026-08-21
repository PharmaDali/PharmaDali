<?php

namespace App\Services\Discount;

use App\Models\Discount;
use App\Repositories\Discount\DiscountRepository;
use Illuminate\Database\Eloquent\Collection;

class DiscountService
{
    protected DiscountRepository $repository;

    public function __construct(DiscountRepository $repository)
    {
        $this->repository = $repository;
    }

    public function getDiscountsForPharmacy(int $pharmacyId): Collection
    {
        $discounts = $this->repository->getByPharmacy($pharmacyId);

        if ($discounts->isEmpty()) {
            $this->seedDefaultDiscounts($pharmacyId);
            $discounts = $this->repository->getByPharmacy($pharmacyId);
        }

        return $discounts;
    }

    public function getActiveDiscountsForPharmacy(int $pharmacyId): Collection
    {
        $discounts = $this->repository->getActiveByPharmacy($pharmacyId);

        if ($discounts->isEmpty()) {
            $this->seedDefaultDiscounts($pharmacyId);
            $discounts = $this->repository->getActiveByPharmacy($pharmacyId);
        }

        return $discounts;
    }

    public function createDiscount(int $pharmacyId, array $data): Discount
    {
        $data['pharmacy_id'] = $pharmacyId;
        if (!isset($data['code']) || empty($data['code'])) {
            $data['code'] = strtoupper(preg_replace('/[^A-Za-z0-9]/', '_', $data['name']));
        }
        return $this->repository->create($data);
    }

    public function updateDiscount(Discount $discount, array $data): Discount
    {
        return $this->repository->update($discount, $data);
    }

    public function deleteDiscount(Discount $discount): bool
    {
        return $this->repository->delete($discount);
    }

    protected function seedDefaultDiscounts(int $pharmacyId): void
    {
        $defaults = [
            [
                'pharmacy_id' => $pharmacyId,
                'name' => 'Senior Citizen',
                'code' => 'SENIOR',
                'percentage' => 20.00,
                'requires_id_number' => true,
                'is_active' => true,
                'description' => 'Mandatory 20% discount for Senior Citizens under RA 9994.',
            ],
            [
                'pharmacy_id' => $pharmacyId,
                'name' => 'PWD (Person With Disability)',
                'code' => 'PWD',
                'percentage' => 20.00,
                'requires_id_number' => true,
                'is_active' => true,
                'description' => 'Mandatory 20% discount for Persons with Disability under RA 10754.',
            ],
            [
                'pharmacy_id' => $pharmacyId,
                'name' => 'Employee Discount',
                'code' => 'EMPLOYEE',
                'percentage' => 10.00,
                'requires_id_number' => true,
                'is_active' => true,
                'description' => 'Standard staff employee courtesy discount.',
            ],
        ];

        foreach ($defaults as $item) {
            $this->repository->create($item);
        }
    }
}
