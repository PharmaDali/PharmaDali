<?php

namespace App\Services\Report;

use App\Repositories\OrderRepository;
use Illuminate\Support\Facades\Auth;

class GetSalesListService
{
    protected $orderRepository;

    public function __construct(OrderRepository $orderRepository)
    {
        $this->orderRepository = $orderRepository;
    }

    /**
     * Execute the service
     * 
     * @param string|null $startDate
     * @param string|null $endDate
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function execute(?string $startDate, ?string $endDate, int $perPage = 15)
    {
        $user = Auth::user();
        $pharmacyId = $user->pharmacy_id;

        if (!$pharmacyId) {
            throw new \Exception("User is not associated with a pharmacy.");
        }

        return $this->orderRepository->getSalesList($pharmacyId, $startDate, $endDate, $perPage);
    }
}
