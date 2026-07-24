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

                $query = Order::withoutGlobalScopes()
                    ->where('pharmacy_id', $pharmacy->id)
                    ->whereIn('status', self::EXPIRABLE_STATUSES);

                if ($isClosed) {
                    // Closed today: expire all remaining open/pickup orders on or before today
                    $query->whereDate('created_at', '<=', $now->toDateString());
                } else {
                    // Open today: expire open orders with scheduled pickup date strictly before today
                    $query->whereDate('scheduled_pickup_at', '<', $now->toDateString());
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

        // Overnight schedule (e.g. 20:00 – 06:00)
        if ($openingMinutes !== null && $openingMinutes >= $closingMinutes) {
            return $currentMinutes >= $closingMinutes && $currentMinutes < $openingMinutes;
        }

        // Normal schedule (e.g. 09:00 – 21:00)
        return $currentMinutes >= $closingMinutes;
    }
}
