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

        $today = Carbon::today();
        $thirtyDaysFromNow = Carbon::today()->addDays(30);

        if ($batch->expiry_date->isBefore($today) || $batch->expiry_date->isAfter($thirtyDaysFromNow)) {
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
            $exists = $admin->notifications->contains(function ($n) use ($batch) {
                return ($n->data['type'] ?? null) === 'Expiry Warning'
                    && (int) ($n->data['batch_id'] ?? 0) === (int) $batch->id;
            });

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
}
