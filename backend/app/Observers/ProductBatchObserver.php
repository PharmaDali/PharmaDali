<?php

namespace App\Observers;

use App\Models\ProductBatch;
use App\Models\User;
use App\Notifications\AdminAlertNotification;
use Carbon\Carbon;

class ProductBatchObserver
{
    /**
     * Handle the ProductBatch "created" event.
     */
    public function created(ProductBatch $batch): void
    {
        $this->evaluateAdaptiveLeadTime($batch);
        $this->evaluateExpiryAlert($batch);
    }

    /**
     * Handle the ProductBatch "updated" event.
     */
    public function updated(ProductBatch $batch): void
    {
        $this->evaluateExpiryAlert($batch);
    }

    /**
     * Evaluate batch expiry and dispatch real-time warning if within 30 days.
     */
    private function evaluateExpiryAlert(ProductBatch $batch): void
    {
        if ($batch->stock <= 0 || !$batch->expiry_date) {
            return;
        }

        $batch->loadMissing(['pharmacyProduct.product', 'pharmacyProduct.pharmacy']);

        $today = Carbon::today();
        $expiryThresholdDays = $batch->pharmacyProduct?->pharmacy?->expiry_days_threshold ?? 30;
        $thresholdDate = Carbon::today()->addDays($expiryThresholdDays);

        if ($batch->expiry_date->isBefore($today) || $batch->expiry_date->isAfter($thresholdDate)) {
            return;
        }

        $pp = $batch->pharmacyProduct;
        if (!$pp || !$pp->product || !$pp->pharmacy) {
            return;
        }

        $pharmacy = $pp->pharmacy;
        $admins = User::where(function ($q) use ($pharmacy) {
            $q->where('pharmacy_id', $pharmacy->id)
              ->orWhereNull('pharmacy_id');
        })
        ->whereIn('role', ['pharmacy_admin', 'pharmacist', 'admin', 'system_admin'])
        ->get();

        if ($admins->isEmpty()) {
            return;
        }

        $expiryFormatted = $batch->expiry_date->format('M. d, Y');
        $daysLeft = (int) $today->diffInDays($batch->expiry_date, false);
        $daysLeftText = $daysLeft <= 0 ? "today" : ($daysLeft === 1 ? "in 1 day" : "in {$daysLeft} days");
        $message = "{$batch->stock} units of {$pp->product->product_name} (Batch: {$batch->batch_number}) will expire {$daysLeftText} (on {$expiryFormatted}).";

        foreach ($admins as $admin) {
            $exists = $admin->notifications()
                ->where('data', 'like', '%"type":"Expiry Warning"%')
                ->where('data', 'like', '%"batch_id":' . $batch->id . '%')
                ->exists();

            if (!$exists) {
                try {
                    $admin->notify(new AdminAlertNotification('Expiry Warning', $message, [
                        'batch_id' => $batch->id,
                        'batch_number' => $batch->batch_number,
                        'product_id' => $pp->product_id,
                        'product_name' => $pp->product->product_name,
                        'expiry_date' => $batch->expiry_date->toDateString(),
                        'days_left' => $daysLeft,
                    ]));
                } catch (\Throwable $e) {
                    \Illuminate\Support\Facades\Log::warning('ProductBatchObserver notification error: ' . $e->getMessage());
                }
            }
        }
    }

    /**
     * Phase 3: Adaptive Lead Time automation.
     * Calculates Exponential Moving Average (EMA) when a restock arrives.
     */
    private function evaluateAdaptiveLeadTime(ProductBatch $batch): void
    {
        $pp = $batch->pharmacyProduct;
        if (!$pp || !$pp->ordered_at) {
            return;
        }

        // 1. Calculate how many days it took to arrive (min 1 day)
        $deliveryDays = max(1, (int) Carbon::parse($pp->ordered_at)->diffInDays(now()));

        // 2. Fallback to 3 if we don't have a historical baseline
        $oldLeadTime = $pp->lead_time_days ?? 3;

        // 3. Exponential Smoothing formula (70% weight to history, 30% to this new arrival)
        $newLeadTime = ($oldLeadTime * 0.7) + ($deliveryDays * 0.3);

        // 4. Update the PharmacyProduct and stop the clock
        $pp->update([
            'lead_time_days' => max(1, (int) round($newLeadTime)),
            'ordered_at'     => null, // Reset the stopwatch
        ]);
    }
}
