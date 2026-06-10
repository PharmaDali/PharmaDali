<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Services\Notification\FcmService;

class OrderExpiredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;

    public function __construct($order)
    {
        $this->order = $order;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Order Expired - ' . $this->order->order_number)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Unfortunately, your order #' . $this->order->order_number . ' could not be fulfilled before the pharmacy closed.')
            ->line('You may place a new order during operating hours.')
            ->line('We apologize for the inconvenience.');
    }

    /**
     * Get the array representation of the notification (database channel).
     * FCM push is sent here so it runs on the queue worker, not the request thread.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        if ($notifiable->fcm_token) {
            app(FcmService::class)->sendPushNotification(
                $notifiable,
                'Order Expired',
                'Your order #' . $this->order->order_number . ' could not be fulfilled before the pharmacy closed.',
                [
                    'order_id' => (string) $this->order->id,
                    'type' => 'order_expired',
                ]
            );
        }

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => 'overdue',
            'message' => 'Your order #' . $this->order->order_number . ' expired because the pharmacy closed before it could be fulfilled.',
            'type' => 'order_expired',
        ];
    }
}
