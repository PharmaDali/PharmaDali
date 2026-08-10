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
     * The frontend is responsible for generating the actual CSV file.
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

        $rows = $orders->map(function ($order) {
            $itemsBreakdown = $order->items->map(function ($item) {
                return $item->product_name . ' (Qty: ' . $item->quantity . ' @ PHP ' . number_format($item->unit_price_snapshot, 2) . ')';
            })->implode('; ');

            $subtotal = (float) ($order->subtotal > 0 ? $order->subtotal : $order->items->sum('line_total'));
            $discountAmount = (float) ($order->discount_amount ?? 0);

            return [
                'order_number'    => $order->order_number,
                'total_items'     => $order->items->sum('quantity'),
                'processed_by'    => $order->verifier
                    ? $order->verifier->first_name . ' ' . $order->verifier->last_name
                    : 'N/A',
                'subtotal'        => number_format($subtotal, 2, '.', ''),
                'discount_type'   => $order->discount_type ?? 'none',
                'discount_amount' => number_format($discountAmount, 2, '.', ''),
                'total_amount'    => number_format($order->total_amount, 2, '.', ''),
                'completed_at'    => $order->completed_at
                    ? $order->completed_at->format('Y-m-d H:i')
                    : 'N/A',
                'items_breakdown' => $itemsBreakdown,
            ];
        })->values()->toArray();

        return [
            'date_range'   => $dateRange,
            'total_amount' => number_format($orders->sum('total_amount'), 2, '.', ''),
            'orders'       => $rows,
        ];
    }
}
