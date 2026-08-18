<?php

namespace App\Services\Dashboard;

use App\Repositories\DashboardRepository;
use App\Services\Inventory\RestockPredictorService;
use Carbon\Carbon;

class GetInventoryHealth
{
    public function __construct(
        protected DashboardRepository $dashboardRepository,
        protected RestockPredictorService $restockService
    ) {}

    /**
     * Compute dashboard inventory health metrics.
     */
    public function handle(int $pharmacyId): array
    {
        $today = Carbon::today();

        // 1. Low stock items: reuse RestockPredictorService algorithm
        $priorityRestocks = $this->restockService->getPriorityRestocks($pharmacyId);
        $lowStockItems = collect($priorityRestocks)
            ->take(5)
            ->map(function ($item) {
                $name  = $item['name'] ?? 'Unknown Product';
                $dos   = $item['days_of_stock'] ?? 0;
                $stock = $item['quantity'] ?? 0;
                $weeks = max(1, (int) ceil($dos / 7));
                $wosLabel = $dos <= 7 ? "< 1 week" : "{$weeks} weeks";
                $note  = $dos <= 7 ? "less than 1 week of supply ({$stock} left)" : "{$weeks} weeks of supply ({$stock} left)";

                return [
                    'name'  => $name,
                    'stock' => $stock,
                    'weeks' => $wosLabel,
                    'note'  => $note,
                ];
            })
            ->values()
            ->toArray();

        // Fallback to DashboardRepository if restock predictor returns empty
        if (empty($lowStockItems)) {
            $lowStockItems = $this->dashboardRepository
                ->getFallbackLowStockProducts($pharmacyId, 50, 5)
                ->map(function ($bp) {
                    $name  = $bp->product->product_name ?? 'Unknown Product';
                    $stock = $bp->stock;
                    $note  = "less than 1 week of supply ({$stock} left)";

                    return [
                        'name'  => $name,
                        'stock' => $stock,
                        'weeks' => "< 1 week",
                        'note'  => $note,
                    ];
                })
                ->values()
                ->toArray();
        }

        // 2. Expiring soon items (via DashboardRepository)
        $expiringItems = $this->dashboardRepository
            ->getExpiringSoonBatches($pharmacyId, $today->toDateString(), $today->copy()->addDays(30)->toDateString(), 5)
            ->map(function ($batch) use ($today) {
                $name  = $batch->pharmacyProduct->product->product_name ?? 'Unknown Product';
                $stock = $batch->stock;
                $days  = (int) $today->diffInDays($batch->expiry_date, false);
                $weeks = max(1, (int) ceil($days / 7));
                $daysLabel = $weeks === 1 ? "1 week left" : "{$weeks} weeks left";

                return [
                    'name'  => $name,
                    'stock' => $stock,
                    'weeks' => $daysLabel,
                    'days'  => $daysLabel,
                ];
            })
            ->values()
            ->toArray();

        return [
            'low_stock'     => $lowStockItems,
            'expiring_soon' => $expiringItems,
        ];
    }
}
