<?php

namespace App\Services\Dashboard;

use App\Traits\ApiResponseTrait;
use Illuminate\Http\Exceptions\HttpResponseException;

class DashboardService
{
    use ApiResponseTrait;

    public function __construct(
        protected GetDashboardOverview $getDashboardOverview,
        protected GetStatCards $getStatCards,
        protected GetQuickInsights $getQuickInsights,
        protected GetSalesTrend $getSalesTrend,
        protected GetInventoryHealth $getInventoryHealth
    ) {}

    public function getDashboardOverview(?int $pharmacyId = null): array
    {
        $pharmacyId = $this->validatePharmacyContext($pharmacyId);

        return $this->getDashboardOverview->handle($pharmacyId);
    }

    public function getSalesTrend(?int $pharmacyId = null, ?string $range = 'Weekly'): array
    {
        $pharmacyId = $this->validatePharmacyContext($pharmacyId);

        return $this->getSalesTrend->handle($pharmacyId, $range);
    }

    public function getStatCards(?int $pharmacyId = null): array
    {
        $pharmacyId = $this->validatePharmacyContext($pharmacyId);

        return $this->getStatCards->handle($pharmacyId);
    }

    public function getQuickInsights(?int $pharmacyId = null): array
    {
        $pharmacyId = $this->validatePharmacyContext($pharmacyId);

        return $this->getQuickInsights->handle($pharmacyId);
    }

    public function getInventoryHealth(?int $pharmacyId = null): array
    {
        $pharmacyId = $this->validatePharmacyContext($pharmacyId);

        return $this->getInventoryHealth->handle($pharmacyId);
    }

    protected function validatePharmacyContext(?int $pharmacyId = null): int
    {
        $this->authorizePermission(null, 'Unauthorized Access');

        $resolvedId = $pharmacyId ?: (int) request()->user()?->pharmacy_id;

        if (!$resolvedId) {
            throw new HttpResponseException(
                $this->errorResponse('Pharmacy context required.', 400)
            );
        }

        return $resolvedId;
    }
}
