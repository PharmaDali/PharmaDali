<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Report\GetSalesSummaryService;
use App\Services\Report\GetSalesListService;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    /**
     * Get the sales summary
     *
     * @param GetSalesSummaryService $getSalesSummaryService
     * @return JsonResponse
     */
    public function getSalesSummary(GetSalesSummaryService $getSalesSummaryService): JsonResponse
    {
        try {
            $summary = $getSalesSummaryService->execute();
            return response()->json($summary);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Get the sales list report
     *
     * @param Request $request
     * @param GetSalesListService $getSalesListService
     * @return JsonResponse
     */
    public function getSalesList(Request $request, GetSalesListService $getSalesListService): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        try {
            $sales = $getSalesListService->execute(
                $request->input('start_date'),
                $request->input('end_date'),
                $request->input('per_page', 15)
            );

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

            return response()->json([
                'data' => $formattedSales,
                'meta' => [
                    'current_page' => $sales->currentPage(),
                    'last_page' => $sales->lastPage(),
                    'per_page' => $sales->perPage(),
                    'total' => $sales->total(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
