<?php

namespace App\Console\Commands;

use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use App\Models\ProductBatch;
use App\Models\User;
use App\Notifications\AdminAlertNotification;
use App\Services\Inventory\RestockPredictorService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckInventoryAlerts extends Command
{
    protected $signature = 'inventory:check-alerts';
    protected $description = 'Scan products, batches, and forecasts to generate alerts (Low Stocks, Expiry Warnings, and Shortages) for pharmacy admins.';

    /**
     * Execute the console command.
     *
     * @param RestockPredictorService $restockPredictorService
     * @return int
     */
    public function handle(RestockPredictorService $restockPredictorService): int
    {
        $this->info('Starting inventory alerts scan...');

        // 1. Process Low Stock Alerts
        $this->processLowStocks($restockPredictorService);

        // 2. Process Expiry Warnings
        $this->processExpiryWarnings();

        // 3. Process Shortage Alerts (using Restock Predictor Service)
        $this->processShortages($restockPredictorService);

        $this->info('Inventory alerts scan completed.');
        return self::SUCCESS;
    }

    /**
     * Scan and alert for low stocks.
     */
    private function processLowStocks(RestockPredictorService $restockPredictorService): void
    {
        $lowStockProducts = PharmacyProduct::with(['product', 'pharmacy.admins'])
            ->where('stock', '<=', 50)
            ->get();

        foreach ($lowStockProducts as $pp) {
            if (!$pp->product || !$pp->pharmacy) {
                continue;
            }

            $admins = User::where(function ($q) use ($pp) {
                $q->where('pharmacy_id', $pp->pharmacy_id)
                  ->orWhereNull('pharmacy_id');
            })
            ->whereIn('role', ['pharmacy_admin', 'pharmacist', 'admin', 'system_admin'])
            ->get();

            if ($admins->isEmpty()) {
                continue;
            }

            // Estimate remaining supply duration
            $daysOfStock = 7;
            try {
                $predictions = $restockPredictorService->getPriorityRestocks($pp->pharmacy_id, 50);
                foreach ($predictions as $pred) {
                    if ((int) ($pred['id'] ?? 0) === (int) $pp->id) {
                        $daysOfStock = (int) ($pred['daysOfStock'] ?? 7);
                        break;
                    }
                }
            } catch (\Throwable $e) {}

            $daysLabel = $daysOfStock <= 1 ? "less than 1 day" : "less than {$daysOfStock} days";
            $message = "Only {$pp->stock} units of {$pp->product->product_name} remaining — this stock will last {$daysLabel}.";

            foreach ($admins as $admin) {
                // Prevent duplicates regardless of whether the previous notification is read or unread
                $exists = $admin->notifications->contains(function ($notification) use ($pp) {
                    return ($notification->data['type'] ?? null) === 'Low Stocks'
                        && (int) ($notification->data['product_id'] ?? 0) === (int) $pp->product_id;
                });

                if (!$exists) {
                    $admin->notify(new AdminAlertNotification('Low Stocks', $message, [
                        'product_id' => $pp->product_id,
                        'product_name' => $pp->product->product_name,
                        'current_stock' => $pp->stock,
                        'days_of_stock' => $daysOfStock,
                    ]));
                }
            }
        }
    }

    /**
     * Scan and alert for expiring product batches.
     */
    private function processExpiryWarnings(): void
    {
        $today = Carbon::today();
        $thirtyDaysFromNow = Carbon::today()->addDays(30);

        // Fetch active batches expiring within 30 days
        $expiringBatches = ProductBatch::with(['pharmacyProduct.product', 'pharmacyProduct.pharmacy.admins'])
            ->where('stock', '>', 0)
            ->whereNotNull('expiry_date')
            ->where('expiry_date', '>=', $today->toDateString())
            ->where('expiry_date', '<=', $thirtyDaysFromNow->toDateString())
            ->get();

        foreach ($expiringBatches as $batch) {
            $pp = $batch->pharmacyProduct;
            if (!$pp || !$pp->product || !$pp->pharmacy) {
                continue;
            }

            $admins = $pp->pharmacy->admins;
            if ($admins->isEmpty()) {
                continue;
            }

            $expiryFormatted = $batch->expiry_date->format('M. d, Y');
            $daysLeft = (int) $today->diffInDays($batch->expiry_date, false);
            $message = "{$batch->stock} units of {$pp->product->product_name} (Batch: {$batch->batch_number}) will expire in {$daysLeft} days (on {$expiryFormatted}).";

            foreach ($admins as $admin) {
                $exists = $admin->notifications->contains(function ($notification) use ($batch) {
                    return ($notification->data['type'] ?? null) === 'Expiry Warning'
                        && (int) ($notification->data['batch_id'] ?? 0) === (int) $batch->id;
                });

                if (!$exists) {
                    $admin->notify(new AdminAlertNotification('Expiry Warning', $message, [
                        'batch_id' => $batch->id,
                        'batch_number' => $batch->batch_number,
                        'product_id' => $pp->product_id,
                        'product_name' => $pp->product->product_name,
                        'expiry_date' => $batch->expiry_date->toDateString(),
                        'days_left' => $daysLeft,
                    ]));
                }
            }
        }
    }

    /**
     * Scan and alert for predicted shortages.
     */
    private function processShortages(RestockPredictorService $restockPredictorService): void
    {
        $pharmacies = Pharmacy::where('is_active', true)->get();

        foreach ($pharmacies as $pharmacy) {
            $admins = $pharmacy->admins;
            if ($admins->isEmpty()) {
                continue;
            }

            try {
                // Get priority restocks predicted
                $restocks = $restockPredictorService->getPriorityRestocks($pharmacy->id, 50);

                foreach ($restocks as $restock) {
                    $daysOfStock = $restock['daysOfStock'] ?? 999;
                    if ($daysOfStock > 7) {
                        continue;
                    }

                    $productName = $restock['name'] ?? 'Product';
                    $productId = $restock['id'] ?? null;
                    if (!$productId) {
                        continue;
                    }

                    $daysLabel = $daysOfStock <= 1 ? "less than 1 day" : "less than 7 days ({$daysOfStock} days remaining)";
                    $message = "{$productName} has {$restock['quantity']} units remaining — this stock will last {$daysLabel} based on current sales velocity ({$restock['averageDailySales']} units/day).";

                    foreach ($admins as $admin) {
                        $exists = $admin->notifications->contains(function ($notification) use ($productId) {
                            return ($notification->data['type'] ?? null) === 'Shortage Alert'
                                && (int) ($notification->data['product_id'] ?? 0) === (int) $productId;
                        });

                        if (!$exists) {
                            $admin->notify(new AdminAlertNotification('Shortage Alert', $message, [
                                'product_id' => $productId,
                                'product_name' => $productName,
                                'days_of_stock' => $daysOfStock,
                                'average_daily_sales' => $restock['averageDailySales'],
                            ]));
                        }
                    }
                }
            } catch (\Throwable $e) {
                Log::error("[CheckInventoryAlerts] Failed to process shortages for pharmacy {$pharmacy->id}: " . $e->getMessage());
            }
        }
    }
}
