<?php

namespace App\Console\Commands;

use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use App\Models\ProductBatch;
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
        $this->processLowStocks();

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
    private function processLowStocks(): void
    {
        $lowStockProducts = PharmacyProduct::with(['product', 'pharmacy.admins'])
            ->where('stock', '<=', 50)
            ->get();

        foreach ($lowStockProducts as $pp) {
            if (!$pp->product || !$pp->pharmacy) {
                continue;
            }

            $admins = $pp->pharmacy->admins;
            if ($admins->isEmpty()) {
                continue;
            }

            $message = "Only {$pp->stock} units of {$pp->product->product_name} remaining. This is below your set threshold.";

            foreach ($admins as $admin) {
                // Check if admin already has an unread notification for this product & type
                $exists = $admin->unreadNotifications()
                    ->where('data->type', 'Low Stocks')
                    ->where('data->product_id', $pp->product_id)
                    ->exists();

                if (!$exists) {
                    $admin->notify(new AdminAlertNotification('Low Stocks', $message, [
                        'product_id' => $pp->product_id,
                        'product_name' => $pp->product->product_name,
                        'current_stock' => $pp->stock,
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
                $exists = $admin->unreadNotifications()
                    ->where('data->type', 'Expiry Warning')
                    ->where('data->batch_id', $batch->id)
                    ->exists();

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
                // Get up to 15 priority restocks predicted
                $restocks = $restockPredictorService->getPriorityRestocks($pharmacy->id, 15);

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

                    $message = "Based on a recent sales velocity of {$restock['averageDailySales']} units/day, {$productName} is predicted to stock out in {$daysOfStock} days.";

                    foreach ($admins as $admin) {
                        $exists = $admin->unreadNotifications()
                            ->where('data->type', 'Shortage Alert')
                            ->where('data->product_id', $productId)
                            ->exists();

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
