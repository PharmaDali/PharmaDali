<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\Pharmacy;
use App\Notifications\OrderExpiredNotification;
use App\Notifications\OrderPickupReminderNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class ExpireOrders extends Command
{
    protected $signature = 'orders:expire';
    protected $description = 'Process order pickup reminders and mark open/unclaimed orders as overdue when pharmacy closing hour or scheduled pickup time passes.';

    /**
     * Statuses that indicate an order is still open / in-progress or awaiting pickup.
     */
    private const EXPIRABLE_STATUSES = ['pending', 'reviewing', 'preparing', 'stand_by', 'ready_for_pickup'];

    public function handle(): int
    {
        $now = Carbon::now(); // Respects app timezone (Asia/Manila)
        $remindersSent = $this->processPickupReminders($now);
        $expiredCount = $this->processOrderExpirations($now);

        $this->info("Sent {$remindersSent} pickup reminder(s). Expired {$expiredCount} order(s).");

        return self::SUCCESS;
    }

    /**
     * Send FCM Push Notification reminders for orders ready for pickup for over 1 hour.
     */
    private function processPickupReminders(Carbon $now): int
    {
        $sentCount = 0;

        $orders = Order::withoutGlobalScopes()
            ->where('status', 'ready_for_pickup')
            ->whereNull('pickup_reminder_sent_at')
            ->with(['customer.user', 'pharmacy'])
            ->get();

        foreach ($orders as $order) {
            $rawTime = $order->scheduled_pickup_at ?? $order->created_at;
            $referenceTime = Carbon::parse(is_object($rawTime) ? $rawTime->toDateTimeString() : (string) $rawTime);

            if ($now->greaterThanOrEqualTo($referenceTime->copy()->addHour())) {
                try {
                    if ($order->customer && $order->customer->user) {
                        $order->customer->user->notify(new OrderPickupReminderNotification($order));
                    }
                    Order::withoutGlobalScopes()
                        ->where('id', $order->id)
                        ->update(['pickup_reminder_sent_at' => $now]);
                    $sentCount++;
                } catch (\Throwable $e) {
                    Log::error('[ExpireOrders] Failed to send pickup reminder for order #' . $order->id . ': ' . $e->getMessage());
                }
            }
        }

        return $sentCount;
    }

    /**
     * Mark orders as overdue when closing hour has passed or when past the scheduled pickup date.
     */
    private function processOrderExpirations(Carbon $now): int
    {
        $expiredCount = 0;

        Pharmacy::where(['is_active' => true])
            ->whereNotNull('closing_hour')
            ->get()
            ->each(function (Pharmacy $pharmacy) use ($now, &$expiredCount) {
                $isClosed = $this->isPharmacyCurrentlyClosed($pharmacy, $now);

                $startOfToday = $now->copy()->startOfDay();
                $endOfToday = $now->copy()->endOfDay();

                if (!$isClosed) {
                    // Open today: expire open orders with scheduled pickup date strictly before today
                    $query = Order::withoutGlobalScopes()
                        ->where('pharmacy_id', $pharmacy->id)
                        ->whereIn('status', self::EXPIRABLE_STATUSES)
                        ->where('scheduled_pickup_at', '<', $startOfToday);
                } else {
                    // Closed: verify if closing time has actually passed today
                    [$closingHour, $closingMinute] = array_map('intval', explode(':', $pharmacy->closing_hour));
                    $closingMinutes = ($closingHour * 60) + $closingMinute;
                    if ($closingMinutes === 0) {
                        $closingMinutes = 1440;
                    }
                    $currentMinutes = ($now->hour * 60) + $now->minute;

                    // If it is currently before opening time today, today's closing time has NOT passed yet
                    $hasClosingPassedToday = $currentMinutes >= $closingMinutes;

                    $query = Order::withoutGlobalScopes()
                        ->where('pharmacy_id', $pharmacy->id)
                        ->whereIn('status', self::EXPIRABLE_STATUSES);

                    if ($hasClosingPassedToday) {
                        // Closing time for today has passed: expire orders created BEFORE or AT closing time today
                        $todayClosingTimestamp = $now->copy()->setTime($closingHour, $closingMinute, 0);
                        $query->where('created_at', '<=', $todayClosingTimestamp);
                    } else {
                        // Before opening hours today: expire orders created on PREVIOUS days only
                        $query->where('created_at', '<', $startOfToday);
                    }
                }

                $orders = $query->with('customer.user')->get();

                foreach ($orders as $order) {
                    $reason = $order->status === 'ready_for_pickup'
                        ? 'Order expired: item was not picked up before pharmacy closing time.'
                        : 'Order expired: pharmacy closed before order could be fulfilled.';

                    Order::withoutGlobalScopes()
                        ->where('id', $order->id)
                        ->update([
                            'status'              => 'overdue',
                            'cancelled_at'        => $now,
                            'cancellation_reason' => $reason,
                        ]);

                    // Update model attribute locally so notification carries updated reason
                    $order->cancellation_reason = $reason;

                    try {
                        if ($order->customer && $order->customer->user) {
                            $order->customer->user->notify(new OrderExpiredNotification($order));
                        }
                    } catch (\Throwable $e) {
                        Log::error('[ExpireOrders] Failed to notify customer for expired order #' . $order->id . ': ' . $e->getMessage());
                    }

                    $expiredCount++;
                }
            });

        return $expiredCount;
    }

    /**
     * Returns true if the pharmacy closing time has passed for today
     * and the pharmacy is therefore currently closed.
     */
    private function isPharmacyCurrentlyClosed(Pharmacy $pharmacy, Carbon $now): bool
    {
        $closing = $pharmacy->closing_hour;
        $opening = $pharmacy->opening_hour;

        if (!$closing) {
            return false;
        }

        [$closingHour, $closingMinute] = array_map('intval', explode(':', $closing));
        $closingMinutes = ($closingHour * 60) + $closingMinute;
        if ($closingMinutes === 0) {
            $closingMinutes = 1440;
        }

        $openingMinutes = 0;
        if ($opening) {
            [$openH, $openM] = array_map('intval', explode(':', $opening));
            $openingMinutes = ($openH * 60) + $openM;
        }

        // 24-hour schedule (e.g., 00:00 to 23:59 or 00:00 to 00:00 / 24:00)
        if ($openingMinutes === 0 && $closingMinutes >= 1439) {
            return false;
        }

        $currentMinutes = ($now->hour * 60) + $now->minute;

        // Overnight schedule (e.g. 20:00 – 06:00)
        if ($openingMinutes >= $closingMinutes) {
            return $currentMinutes >= $closingMinutes && $currentMinutes < $openingMinutes;
        }

        // Normal schedule (e.g. 08:00 – 22:00)
        return $currentMinutes >= $closingMinutes || $currentMinutes < $openingMinutes;
    }
}
