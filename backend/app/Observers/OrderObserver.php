<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\User;
use App\Notifications\AdminAlertNotification;
use Illuminate\Support\Facades\Log;

class OrderObserver
{
    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        $this->notifyStaffAndAdmins($order, 'created');
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        // Pharmacists and staff perform status updates directly and do not receive notification alerts for status changes.
    }

    /**
     * Send real-time broadcast notification to pharmacy staff and admins.
     */
    private function notifyStaffAndAdmins(Order $order, string $event): void
    {
        // POS walk-in sales are over-the-counter transactions and do not generate order alert notifications
        if (str_starts_with((string) $order->order_number, 'POS-') || $order->customer_id === null) {
            return;
        }

        $pharmacyId = $order->pharmacy_id;
        if (!$pharmacyId) {
            return;
        }

        // Target admins and system staff only (Pharmacists are notified directly via NewOrderPharmacistNotification in PlaceOrderService)
        $admins = User::where(function ($q) use ($pharmacyId) {
            $q->where('pharmacy_id', $pharmacyId)
              ->orWhereNull('pharmacy_id');
        })
        ->whereIn('role', ['pharmacy_admin', 'admin', 'system_admin'])
        ->get();

        if ($admins->isEmpty()) {
            return;
        }

        $customerUser = $order->customer?->user;
        $customerName = $customerUser ? "{$customerUser->first_name} {$customerUser->last_name}" : "Customer";
        $fulfillment = "In-Store Pickup";

        if ($event === 'created') {
            $message = "New order #{$order->order_number} placed by {$customerName} ({$fulfillment}).";
        } else {
            $statusFormatted = $order->status->label();
            $reasonInfo = $order->cancellation_reason ? " (Reason: {$order->cancellation_reason})" : "";
            $message = "Order #{$order->order_number} status updated to {$statusFormatted}{$reasonInfo}.";
        }

        foreach ($admins as $admin) {
            $exists = $admin->notifications->contains(function ($n) use ($order) {
                return ($n->data['order_id'] ?? 0) === $order->id;
            });

            if (!$exists) {
                try {
                    $admin->notify(new AdminAlertNotification('System Alert', $message, [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'status' => $order->status,
                        'event' => $event,
                        'fulfillment_type' => $order->fulfillment_type,
                    ]));
                } catch (\Throwable $e) {
                    Log::warning('OrderObserver notification dispatch error: ' . $e->getMessage());
                }
            }
        }
    }
}
