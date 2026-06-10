<?php

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Order;
use App\Notifications\OrderExpiredNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireOrders extends Command
{
    protected $signature = 'orders:expire';
    protected $description = 'Mark orders as overdue when the branch closing hour has passed and the order is still incomplete.';

    /**
     * Statuses that indicate an order is still open / in-progress.
     * These are the only ones that should be expired at closing time.
     */
    private const EXPIRABLE_STATUSES = ['pending', 'reviewing', 'preparing', 'stand_by'];

    public function handle(): int
    {
        $now = now(); // Respects app timezone (Asia/Manila)
        $expired = 0;

        Branch::where('is_active', true)
            ->whereNotNull('closing_hour')
            ->get()
            ->each(function (Branch $branch) use ($now, &$expired) {
                if (!$this->isBranchCurrentlyClosed($branch, $now)) {
                    return; // Branch is still open — skip
                }

                // Find all non-completed orders for this branch
                $orders = Order::where('branch_id', $branch->id)
                    ->whereIn('status', self::EXPIRABLE_STATUSES)
                    ->whereDate('created_at', $now->toDateString()) // Only today's orders
                    ->get();

                foreach ($orders as $order) {
                    $order->update([
                        'status' => 'overdue',
                        'cancelled_at' => $now,
                        'cancellation_reason' => 'Order expired: pharmacy closed before order could be fulfilled.',
                    ]);

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
     * Returns true if the branch closing time has passed for today
     * and the branch is therefore currently closed.
     */
    private function isBranchCurrentlyClosed(Branch $branch, $now): bool
    {
        $closing = $branch->closing_hour; // e.g. "21:00:00"

        if (!$closing) {
            return false;
        }

        [$closingHour, $closingMinute] = array_map('intval', explode(':', $closing));
        $closingMinutes = ($closingHour * 60) + $closingMinute;

        $currentMinutes = ($now->hour * 60) + $now->minute;

        $openingMinutes = null;
        if ($branch->opening_hour) {
            [$openH, $openM] = array_map('intval', explode(':', $branch->opening_hour));
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
