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
     * The frontend is responsible for rendering and printing the PDF.
     *
     * @param string|null $startDate
     * @param string|null $endDate
     * @return array
     */
    public function execute(?string $startDate, ?string $endDate): array
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

        $rows = $orders->map(function ($order) {
            return [
                'order_number' => $order->order_number,
                'total_items'  => $order->items->sum('quantity'),
                'processed_by' => $order->verifier
                    ? $order->verifier->first_name . ' ' . $order->verifier->last_name
                    : 'N/A',
                'total_amount' => number_format($order->total_amount, 2, '.', ''),
                'completed_at' => $order->completed_at
                    ? $order->completed_at->format('Y-m-d H:i')
                    : 'N/A',
            ];
        })->values()->toArray();

        return [
            'date_range'   => $dateRange,
            'total_amount' => number_format($totalAmount, 2, '.', ''),
            'orders'       => $rows,
        ];
    }
}

