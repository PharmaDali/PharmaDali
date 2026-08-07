<?php

namespace App\Notifications;

use App\Services\Notification\FcmService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class OrderPickupReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected bool $pushSent = false;

    public function __construct(public $order)
    {
    }

    /**
     * Notification delivery channels (FCM Push + Database notification - NO email).
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Database representation and FCM Push trigger.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $pharmacyName = $this->order->pharmacy?->pharmacy_name ?? 'the pharmacy';
        $title = 'Order Pickup Reminder';
        $body = "Friendly reminder: Your order #{$this->order->order_number} is ready for pickup at {$pharmacyName}. Please pick it up before closing time!";

        if (!empty($notifiable->fcm_token) && !$this->pushSent) {
            $this->pushSent = true;
            try {
                app(FcmService::class)->sendPushNotification(
                    $notifiable,
                    $title,
                    $body,
                    [
                        'order_id' => (string) $this->order->id,
                        'type'     => 'order_pickup_reminder',
                    ]
                );
            } catch (\Throwable $e) {
                // Ignore FCM errors during queued delivery
            }
        }

        return [
            'order_id'     => $this->order->id,
            'order_number' => $this->order->order_number,
            'status'       => $this->order->status,
            'message'      => $body,
            'type'         => 'order_pickup_reminder',
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $pharmacyName = $this->order->pharmacy?->pharmacy_name ?? 'the pharmacy';
        $body = "Friendly reminder: Your order #{$this->order->order_number} is ready for pickup at {$pharmacyName}. Please pick it up before closing time!";

        return new BroadcastMessage([
            'id'           => $this->id,
            'order_id'     => $this->order->id,
            'order_number' => $this->order->order_number,
            'status'       => $this->order->status,
            'message'      => $body,
            'type'         => 'order_pickup_reminder',
        ]);
    }
}
