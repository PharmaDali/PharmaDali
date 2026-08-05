<?php

namespace App\Observers;

use App\Models\Order;
use App\Models\User;
use App\Notifications\AdminAlertNotification;

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
        if ($order->wasChanged('status')) {
            $this->notifyStaffAndAdmins($order, 'status_updated');
        }
    }

    /**
     * Send real-time broadcast notification to pharmacy staff and admins.
     */
    private function notifyStaffAndAdmins(Order $order, string $event): void
    {
        $pharmacyId = $order->pharmacy_id;
        if (!$pharmacyId) {
            return;
        }

        $admins = User::where(function ($q) use ($pharmacyId) {
            $q->where('pharmacy_id', $pharmacyId)
              ->orWhereNull('pharmacy_id');
        })
        ->whereIn('role', ['pharmacy_admin', 'pharmacist', 'admin', 'system_admin'])
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
            $statusFormatted = ucfirst(str_replace('_', ' ', $order->status));
            $reasonInfo = $order->cancellation_reason ? " (Reason: {$order->cancellation_reason})" : "";
            $message = "Order #{$order->order_number} status updated to {$statusFormatted}{$reasonInfo}.";
        }

        foreach ($admins as $admin) {
            $exists = $admin->notifications->contains(function ($n) use ($order, $event) {
                return ($n->data['order_id'] ?? 0) === $order->id
                    && ($n->data['event'] ?? '') === $event;
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
                    \Illuminate\Support\Facades\Log::warning('OrderObserver notification dispatch error: ' . $e->getMessage());
                }
            }
        }
    }
}
