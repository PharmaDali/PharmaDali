<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Report\GetSalesSummaryService;
use App\Services\Report\GetSalesListService;
use App\Services\Report\ExportSalesCsvService;
use App\Services\Report\ExportSalesPdfService;
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

    /**
     * Export sales report as CSV
     */
    public function exportSalesCsv(Request $request, ExportSalesCsvService $exportSalesCsvService)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        try {
            $orders = $exportSalesCsvService->execute(
                $request->input('start_date'),
                $request->input('end_date')
            );

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="sales_report_' . date('Ymd_His') . '.csv"',
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0',
            ];

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

            return response()->stream($callback, 200, $headers);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Export sales report as printable PDF/HTML
     */
    public function exportSalesPdf(Request $request, ExportSalesPdfService $exportSalesPdfService)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        try {
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            $orders = $exportSalesPdfService->execute($startDate, $endDate);

            $dateRange = 'All Time';
            if ($startDate && $endDate) {
                $dateRange = $startDate . ' to ' . $endDate;
            } elseif ($startDate) {
                $dateRange = 'From ' . $startDate;
            } elseif ($endDate) {
                $dateRange = 'Up to ' . $endDate;
            }

            $totalAmount = $orders->sum('total_amount');

            return view('reports.sales-pdf', [
                'orders' => $orders,
                'date_range' => $dateRange,
                'total_amount' => $totalAmount
            ]);

        } catch (\Exception $e) {
            return response('Error generating report: ' . $e->getMessage(), 400);
        }
    }
}

