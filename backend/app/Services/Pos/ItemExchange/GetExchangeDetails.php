<?php

namespace App\Services\Pos\ItemExchange;

use App\Models\ItemExchange;
use App\Repositories\ItemExchangeRepository;

class GetExchangeDetails
{
    public function __construct(
        private readonly ItemExchangeRepository $repository,
    ) {}

    /**
     * Get details of a single exchange via repository.
     */
    public function execute(int $exchangeId, $user): ItemExchange
    {
        $pharmacyId = $user->pharmacy_id ?? $user->pharmacy?->id ?? 1;
        return $this->repository->findWithRelations($exchangeId, $pharmacyId);
    }
}
