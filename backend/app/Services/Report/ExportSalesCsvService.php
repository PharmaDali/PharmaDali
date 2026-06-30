<?php

namespace App\Services\Report;

use App\Repositories\OrderRepository;
use Illuminate\Support\Facades\Auth;

class ExportSalesCsvService
{
    protected $orderRepository;

    public function __construct(OrderRepository $orderRepository)
    {
        $this->orderRepository = $orderRepository;
    }

    /**
     * Execute the service and return structured data for CSV export.
     * 
     * @param string|null $startDate
     * @param string|null $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function execute(?string $startDate, ?string $endDate)
    {
        $user = Auth::user();
        $pharmacyId = $user->pharmacy_id;

        if (!$pharmacyId) {
            throw new \Exception("User is not associated with a pharmacy.");
        }

        return $this->orderRepository->getSalesListAll($pharmacyId, $startDate, $endDate);
    }
}
