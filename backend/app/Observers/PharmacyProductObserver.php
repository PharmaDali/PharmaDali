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

        // 1. Check Low Stock Threshold (stock <= 50)
        if ($pharmacyProduct->stock <= 50) {
            $message = "Only {$pharmacyProduct->stock} units of {$product->product_name} remaining. This is below your set threshold.";

            foreach ($admins as $admin) {
                $exists = $admin->notifications->contains(function ($n) use ($pharmacyProduct) {
                    return ($n->data['type'] ?? null) === 'Low Stocks'
                        && (int) ($n->data['product_id'] ?? 0) === (int) $pharmacyProduct->product_id;
                });

                if (!$exists) {
                    $admin->notify(new AdminAlertNotification('Low Stocks', $message, [
                        'product_id' => $pharmacyProduct->product_id,
                        'product_name' => $product->product_name,
                        'current_stock' => $pharmacyProduct->stock,
                    ]));
                }
            }
        }

        // 2. Check Shortage / Sales Velocity Forecast (daysOfStock <= 7) in real-time
        try {
            /** @var RestockPredictorService $predictorService */
            $predictorService = app(RestockPredictorService::class);
            $predictorService->clearPriorityRestocksCache($pharmacy->id);

            $predictions = $predictorService->getPriorityRestocks($pharmacy->id, 50);

            foreach ($predictions as $prediction) {
                if ((int) ($prediction['id'] ?? 0) === (int) $pharmacyProduct->id) {
                    $daysOfStock = $prediction['daysOfStock'] ?? 999;

                    if ($daysOfStock <= 7) {
                        $daysLabel = $daysOfStock <= 1 ? "less than 1 day" : "less than 7 days ({$daysOfStock} days remaining)";
                        $message = "{$product->product_name} has {$pharmacyProduct->stock} units remaining — this stock will last {$daysLabel} based on current sales velocity ({$prediction['averageDailySales']} units/day).";

                        foreach ($admins as $admin) {
                            $exists = $admin->notifications->contains(function ($n) use ($pharmacyProduct) {
                                return ($n->data['type'] ?? null) === 'Shortage Alert'
                                    && (int) ($n->data['product_id'] ?? 0) === (int) $pharmacyProduct->product_id;
                            });

                            if (!$exists) {
                                $admin->notify(new AdminAlertNotification('Shortage Alert', $message, [
                                    'product_id' => $pharmacyProduct->product_id,
                                    'product_name' => $product->product_name,
                                    'current_stock' => $pharmacyProduct->stock,
                                    'days_of_stock' => $daysOfStock,
                                    'average_daily_sales' => $prediction['averageDailySales'],
                                ]));
                            }
                        }
                    }
                    break;
                }
            }
        } catch (\Throwable $e) {
            // Silently handle if predictor service is not bound
        }
    }
}
