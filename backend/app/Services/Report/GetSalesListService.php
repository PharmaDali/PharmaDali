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
     * Execute the service and return structured, formatted sales data with metadata.
     * 
     * @param string|null $startDate
     * @param string|null $endDate
     * @param int $perPage
     * @return array
     */
    public function execute(?string $startDate, ?string $endDate, int $perPage = 15)
    {
        $user = Auth::user();
        $pharmacyId = $user->pharmacy_id;

        if (!$pharmacyId) {
            throw new \Exception("User is not associated with a pharmacy.");
        }

        $sales = $this->orderRepository->getSalesList($pharmacyId, $startDate, $endDate, $perPage);

        $formattedSales = collect($sales->items())->map(function ($order) {
            return [
                'id' => $order->order_number,
                'items' => $order->items->sum('quantity'),
                'processedBy' => $order->verifier ? $order->verifier->first_name . ' ' . $order->verifier->last_name : 'N/A',
                'total' => $order->total_amount,
                'date' => $order->completed_at ? $order->completed_at->format('Y-m-d H:i') : null,
                'orderItems' => $order->items->map(function ($item) {
                    return [
                        'name' => $item->product_name,
                        'qty' => $item->quantity,
                        'price' => $item->unit_price_snapshot,
                        'subtotal' => $item->line_total,
                    ];
                }),
            ];
        });

        return [
            'data' => $formattedSales,
            'meta' => [
                'current_page' => $sales->currentPage(),
                'last_page' => $sales->lastPage(),
                'per_page' => $sales->perPage(),
                'total' => $sales->total(),
            ]
        ];
    }
}
