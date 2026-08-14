<?php

namespace App\Services\Inventory;

use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use Illuminate\Support\Collection;

class InventoryService
{
    public function __construct(
        private readonly GetInventoryMetricsService $metricsService,
        private readonly GetInventoryProductsService $productsService,
        private readonly GetInventoryLogsService $logsService,
    ) {}

    public function getInventoryMetrics(?int $pharmacyId = null): array
    {
        return $this->metricsService->handle($pharmacyId);
    }

    public function getTotalProductCount(): int
    {
        return PharmacyProduct::count();
    }

    public function getInventoryProducts(array $filters = [], ?Pharmacy $pharmacy = null): Collection
    {
        return $this->productsService->handle($filters, $pharmacy);
    }

    public function getInventoryLogs(array $filters = []): Collection
    {
        return $this->logsService->handle($filters);
    }
}