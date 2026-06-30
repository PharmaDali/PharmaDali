<?php

namespace App\Services\Report;

use App\Repositories\OrderRepository;
use Illuminate\Support\Facades\Auth;

class ExportSalesPdfService
{
    protected $orderRepository;

    public function __construct(OrderRepository $orderRepository)
    {
        $this->orderRepository = $orderRepository;
    }

    /**
     * Execute the service and return structured data for PDF export.
     * 
     * @param string|null $startDate
     * @param string|null $endDate
     * @return array
     */
    public function execute(?string $startDate, ?string $endDate)
    {
        $user = Auth::user();
        $pharmacyId = $user->pharmacy_id;

        if (!$pharmacyId) {
            throw new \Exception("User is not associated with a pharmacy.");
        }

        $orders = $this->orderRepository->getSalesListAll($pharmacyId, $startDate, $endDate);

        $dateRange = 'All Time';
        if ($startDate && $endDate) {
            $dateRange = $startDate . ' to ' . $endDate;
        } elseif ($startDate) {
            $dateRange = 'From ' . $startDate;
        } elseif ($endDate) {
            $dateRange = 'Up to ' . $endDate;
        }

        $totalAmount = $orders->sum('total_amount');

        return [
            'orders' => $orders,
            'date_range' => $dateRange,
            'total_amount' => $totalAmount,
        ];
    }
}
