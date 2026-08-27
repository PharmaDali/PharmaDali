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

    public function execute(?string $startDate, ?string $endDate, int $perPage = 15)
    {
        $user = Auth::user();
        $pharmacyId = $user->pharmacy_id;

        if (!$pharmacyId) {
            throw new \Exception("User is not associated with a pharmacy.");
        }

        $sales = $this->orderRepository->getSalesList($pharmacyId, $startDate, $endDate, $perPage, $user);

        $formattedSales = collect($sales->items())->map(function ($order) {
            $itemsLineTotal = (float) $order->items->sum('line_total');
            $discountAmount = (float) ($order->discount_amount ?? 0);
            $grossSubtotal = $itemsLineTotal > 0 
                ? $itemsLineTotal 
                : ((float) $order->total_amount + $discountAmount);

            $hasExchange = $order->exchanges && $order->exchanges->isNotEmpty();
            $status = $hasExchange ? 'exchanged' : strtolower($order->status?->value ?? 'completed');

            return [
                'id' => $order->order_number,
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'items' => $order->items->sum('quantity'),
                'processedBy' => $order->verifier ? $order->verifier->first_name . ' ' . $order->verifier->last_name : 'N/A',
                'subtotal' => $grossSubtotal,
                'discountType' => $order->discount_type ?? 'none',
                'discountPercentage' => (float) ($order->discount_percentage ?? 0),
                'discountAmount' => $discountAmount,
                'discountIdNumber' => $order->discount_id_number,
                'discountRemarks' => $order->discount_remarks,
                'total' => (float) $order->total_amount,
                'status' => $status,
                'has_exchange' => $hasExchange,
                'exchange_count' => $order->exchanges ? $order->exchanges->count() : 0,
                'exchanges' => $order->exchanges ? $order->exchanges->map(function ($exc) {
                    return [
                        'id' => $exc->id,
                        'exchange_number' => $exc->exchange_number,
                        'total_returned_value' => (float) $exc->total_returned_value,
                        'total_replacement_value' => (float) $exc->total_replacement_value,
                        'additional_payment' => (float) $exc->additional_payment,
                        'reason' => $exc->reason,
                        'created_at' => $exc->created_at ? $exc->created_at->format('Y-m-d H:i') : null,
                    ];
                }) : [],
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
