<?php

namespace App\Console\Commands;

use App\Models\Pharmacy;
use App\Models\Order;
use App\Notifications\OrderExpiredNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireOrders extends Command
{
    protected $signature = 'orders:expire';
    protected $description = 'Mark orders as overdue when the pharmacy closing hour has passed and the order is still incomplete.';

    /**
     * Statuses that indicate an order is still open / in-progress.
     * These are the only ones that should be expired at closing time.
     */
    private const EXPIRABLE_STATUSES = ['pending', 'reviewing', 'preparing', 'stand_by'];

    public function handle(): int
    {
        $now = now(); // Respects app timezone (Asia/Manila)
        $expired = 0;

        Pharmacy::where(['is_active' => true])
            ->whereNotNull('closing_hour')
            ->get()
            ->each(function (Pharmacy $pharmacy) use ($now, &$expired) {
                if (!$this->isPharmacyCurrentlyClosed($pharmacy, $now)) {
                    return; // Pharmacy is still open — skip
                }

                // Collect IDs of all orders that need to expire
                $orderIds = Order::where(['pharmacy_id' => $pharmacy->id])
                    ->whereIn('status', self::EXPIRABLE_STATUSES)
                    ->whereDate('created_at', $now->toDateString()) // Only today's orders
                    ->pluck('id');

                if ($orderIds->isEmpty()) {
                    return;
                }

                // Bulk update via query builder — no stdClass risk
                Order::whereIn('id', $orderIds)->update([
                    'status' => 'overdue',
                    'cancelled_at' => $now,
                    'cancellation_reason' => 'Order expired: pharmacy closed before order could be fulfilled.',
                ]);

                // Reload as Eloquent models with relations for notifications
                $orders = Order::whereIn('id', $orderIds)
                    ->with('customer.user')
                    ->get();

                foreach ($orders as $order) {
                    // Notify the customer (runs on queue worker)
                    try {
                        if ($order->customer && $order->customer->user) {
                            $order->customer->user->notify(new OrderExpiredNotification($order));
                        }
                    } catch (\Throwable $e) {
                        Log::error('[ExpireOrders] Failed to notify customer for order #' . $order->id . ': ' . $e->getMessage());
                    }

                    $expired++;
                }
            });

        $this->info("Expired {$expired} order(s).");

        return self::SUCCESS;
    }

    /**
     * Returns true if the pharmacy closing time has passed for today
     * and the pharmacy is therefore currently closed.
     */
    private function isPharmacyCurrentlyClosed(Pharmacy $pharmacy, $now): bool
    {
        $closing = $pharmacy->closing_hour; // e.g. "21:00:00"

        if (!$closing) {
            return false;
        }

        [$closingHour, $closingMinute] = array_map('intval', explode(':', $closing));
        $closingMinutes = ($closingHour * 60) + $closingMinute;

        $currentMinutes = ($now->hour * 60) + $now->minute;

        $openingMinutes = null;
        if ($pharmacy->opening_hour) {
            [$openH, $openM] = array_map('intval', explode(':', $pharmacy->opening_hour));
            $openingMinutes = ($openH * 60) + $openM;
        }

        // Overnight schedule (e.g. 20:00 – 06:00): expires after closing minute wraps around
        if ($openingMinutes !== null && $openingMinutes >= $closingMinutes) {
            // Closed window is from closingMinutes to openingMinutes
            return $currentMinutes >= $closingMinutes && $currentMinutes < $openingMinutes;
        }

        // Normal schedule (e.g. 09:00 – 21:00): closed once past closing time
        return $currentMinutes >= $closingMinutes;
    }
}
