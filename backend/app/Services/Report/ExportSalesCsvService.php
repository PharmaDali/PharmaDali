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

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');
            
            // UTF-8 BOM
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            fputcsv($file, [
                'Order ID',
                'Total Items',
                'Processed By',
                'Total Amount (PHP)',
                'Date Completed',
                'Items Breakdown'
            ]);

            foreach ($orders as $order) {
                $itemsBreakdown = $order->items->map(function ($item) {
                    return $item->product_name . ' (Qty: ' . $item->quantity . ' @ PHP ' . number_format($item->unit_price_snapshot, 2) . ')';
                })->implode('; ');

                fputcsv($file, [
                    $order->order_number,
                    $order->items->sum('quantity'),
                    $order->verifier ? $order->verifier->first_name . ' ' . $order->verifier->last_name : 'N/A',
                    number_format($order->total_amount, 2, '.', ''),
                    $order->completed_at ? $order->completed_at->format('Y-m-d H:i') : 'N/A',
                    $itemsBreakdown
                ]);
            }

            fclose($file);
        };

        return [
            'filename' => 'sales_report_' . date('Ymd_His') . '.csv',
            'callback' => $callback
        ];
    }
}
