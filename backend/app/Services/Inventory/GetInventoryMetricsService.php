<?php

namespace App\Services\Inventory;

use App\Models\PharmacyProduct;
use Carbon\Carbon;

class GetInventoryMetricsService
{
    public function __construct(
        private readonly RestockPredictorService $restockPredictorService,
    ) {}

    public function handle(?int $pharmacyId = null): array
    {
        $today = Carbon::today()->toDateString();
        $expiringLimit = Carbon::today()->addDays(30)->toDateString();

        $totalProducts = PharmacyProduct::count();

        $lowStocks = 0;
        try {
            $pharmacyId = $pharmacyId ?? 1;
            $predictions = $this->restockPredictorService->getPriorityRestocks($pharmacyId, 200);
            $lowStocks = count($predictions);
        } catch (\Throwable $e) {
            $lowStocks = PharmacyProduct::where('stock', '<=', 10)->count();
        }

        $expiring = PharmacyProduct::whereHas('batches', function ($q) use ($today, $expiringLimit) {
            $q->whereNotNull('expiry_date')
              ->where('stock', '>', 0)
              ->where('expiry_date', '>', $today)
              ->where('expiry_date', '<=', $expiringLimit);
        })->count();

        $expired = PharmacyProduct::whereHas('batches', function ($q) use ($today) {
            $q->whereNotNull('expiry_date')
              ->where('stock', '>', 0)
              ->where('expiry_date', '<=', $today);
        })->count();

        return [
            'total_products' => $totalProducts,
            'low_stocks'     => $lowStocks,
            'expiring'       => $expiring,
            'expired'        => $expired,
        ];
    }
}
