<?php

namespace App\Observers;

use App\Models\PharmacyProduct;
use App\Models\User;
use App\Notifications\AdminAlertNotification;
use App\Services\Inventory\RestockPredictorService;

class PharmacyProductObserver
{
    /**
     * Handle the PharmacyProduct "created" event.
     */
    public function created(PharmacyProduct $pharmacyProduct): void
    {
        $this->evaluateRealtimeAlerts($pharmacyProduct);
    }

    /**
     * Handle the PharmacyProduct "updated" event.
     */
    public function updated(PharmacyProduct $pharmacyProduct): void
    {
        if ($pharmacyProduct->wasChanged('stock')) {
            $this->evaluateRealtimeAlerts($pharmacyProduct);
        }
    }

    /**
     * Evaluate stock levels and sales velocity predictions in real-time.
     */
    private function evaluateRealtimeAlerts(PharmacyProduct $pharmacyProduct): void
    {
        $product = $pharmacyProduct->product;
        $pharmacy = $pharmacyProduct->pharmacy;

        if (!$product || !$pharmacy) {
            return;
        }

        // Include all staff and admin users for this pharmacy
        $admins = User::where(function ($q) use ($pharmacy) {
            $q->where('pharmacy_id', $pharmacy->id)
              ->orWhereNull('pharmacy_id');
        })
        ->whereIn('role', ['pharmacy_admin', 'pharmacist', 'admin', 'system_admin'])
        ->get();

        if ($admins->isEmpty()) {
            return;
        }

        // Fetch predicted restocks to determine stock forecast duration for ALL stock alerts
        $daysOfStock = 7;
        $averageDailySales = 0;

        $isRestockRequired = false;
        $reorderPoint = 10;

        try {
            /** @var RestockPredictorService $predictorService */
            $predictorService = app(RestockPredictorService::class);
            $predictorService->clearPriorityRestocksCache($pharmacy->id);

            $predictions = $predictorService->getPriorityRestocks($pharmacy->id, 100);

            foreach ($predictions as $prediction) {
                if ((int) ($prediction['id'] ?? 0) === (int) $pharmacyProduct->id) {
                    $daysOfStock = (int) ($prediction['daysOfStock'] ?? 7);
                    $averageDailySales = $prediction['averageDailySales'] ?? 0;
                    $reorderPoint = $prediction['reorderPoint'] ?? 10;
                    $isRestockRequired = true;
                    break;
                }
            }
        } catch (\Throwable $e) {
            // fallback defaults
        }

        $daysLabel = $daysOfStock <= 1 ? "less than 1 day" : "less than {$daysOfStock} days";

        // Dynamic Restock Alert — triggered when stock <= ROP or DOS <= 7 days
        if ($isRestockRequired || $daysOfStock <= 7 || $pharmacyProduct->stock <= $reorderPoint) {
            $message = "Only {$pharmacyProduct->stock} units of {$product->product_name} remaining — this stock will last {$daysLabel}.";

            foreach ($admins as $admin) {
                $exists = $admin->notifications->contains(function ($n) use ($pharmacyProduct) {
                    return in_array($n->data['type'] ?? null, ['Low Stocks', 'Shortage Alert'])
                        && (int) ($n->data['product_id'] ?? 0) === (int) $pharmacyProduct->product_id;
                });

                if (!$exists) {
                    try {
                        $admin->notify(new AdminAlertNotification('Shortage Alert', $message, [
                            'product_id' => $pharmacyProduct->product_id,
                            'product_name' => $product->product_name,
                            'current_stock' => $pharmacyProduct->stock,
                            'days_of_stock' => $daysOfStock,
                            'average_daily_sales' => $averageDailySales,
                        ]));
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::warning('PharmacyProductObserver notification error: ' . $e->getMessage());
                    }
                }
            }
        }
    }
}
