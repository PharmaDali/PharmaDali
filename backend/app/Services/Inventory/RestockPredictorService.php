<?php

namespace App\Services\Inventory;

use App\Algorithms\RestockPredictor;
use App\Repositories\RestockRepository;
use Illuminate\Support\Facades\Cache;

class RestockPredictorService
{
    private const CACHE_TTL_SECONDS = 3600; // 1 hour

    public function __construct(
        private readonly RestockRepository $restockRepository,
        private readonly RestockPredictor  $predictor,
    ) {}

    /**
     * Get priority restock predictions for a given pharmacy.
     *
     * Responsibilities:
     *  1. Orchestrate data retrieval via the repository.
     *  2. Pass raw data to the algorithm class.
     *  3. Cache the result to avoid repeated expensive DB queries.
     *
     * @param  int $pharmacyId
     * @param  int $limit       Max number of results
     * @return array
     */
    public function getPriorityRestocks(int $pharmacyId, int $limit = 5): array
    {
        $cacheKey = "pharmacy_{$pharmacyId}_priority_restocks";

        return Cache::remember($cacheKey, self::CACHE_TTL_SECONDS, function () use ($pharmacyId, $limit) {
            $snapshot = $this->restockRepository->getProductSalesSnapshot($pharmacyId);

            return $this->predictor->predict($snapshot, $limit);
        });
    }

    /**
     * Clears the priority restocks cache for a given pharmacy.
     *
     * @param int $pharmacyId
     */
    public function clearPriorityRestocksCache(int $pharmacyId): void
    {
        $cacheKey = "pharmacy_{$pharmacyId}_priority_restocks";
        Cache::forget($cacheKey);
    }
}
