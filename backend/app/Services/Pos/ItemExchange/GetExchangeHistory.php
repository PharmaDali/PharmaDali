<?php

namespace App\Services\Pos\ItemExchange;

use App\Repositories\ItemExchangeRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class GetExchangeHistory
{
    public function __construct(
        private readonly ItemExchangeRepository $repository,
    ) {}

    /**
     * Get paginated exchange history for pharmacy via repository.
     */
    public function execute(array $filters, $user): LengthAwarePaginator
    {
        $search = $filters['search'] ?? null;
        $perPage = (int) ($filters['per_page'] ?? 15);
        $pharmacyId = (int) ($user->pharmacy_id ?? $user->pharmacy?->id ?? 1);

        return $this->repository->getPaginatedHistory($pharmacyId, $search, $perPage);
    }
}
