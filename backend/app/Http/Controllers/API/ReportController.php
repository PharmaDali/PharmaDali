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
            $result = $getSalesListService->execute(
                $request->input('start_date'),
                $request->input('end_date'),
                $request->input('per_page', 15)
            );
            return response()->json($result);
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
            $result = $exportSalesCsvService->execute(
                $request->input('start_date'),
                $request->input('end_date')
            );

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="' . $result['filename'] . '"',
                'Pragma' => 'no-cache',
                'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
                'Expires' => '0',
            ];

            return response()->stream($result['callback'], 200, $headers);

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
            $data = $exportSalesPdfService->execute(
                $request->input('start_date'),
                $request->input('end_date')
            );

            return view('reports.sales-pdf', $data);

        } catch (\Exception $e) {
            return response('Error generating report: ' . $e->getMessage(), 400);
        }
    }
}

