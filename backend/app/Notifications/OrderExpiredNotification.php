<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Services\Notification\FcmService;

class OrderExpiredNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;
    protected bool $pushSent = false;

    public function __construct($order)
    {
        $this->order = $order;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
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
        if ($notifiable->fcm_token && !$this->pushSent) {
            $this->pushSent = true;
            try {
                app(FcmService::class)->sendPushNotification(
                    $notifiable,
                    'Order Expired',
                    'Your order #' . $this->order->order_number . ' could not be fulfilled before the pharmacy closed.',
                    [
                        'order_id' => (string) $this->order->id,
                        'type' => 'order_expired',
                    ]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('OrderExpiredNotification FCM push error: ' . $e->getMessage());
            }
        }

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => 'overdue',
            'message' => 'Your order #' . $this->order->order_number . ' expired because the pharmacy closed before it could be fulfilled.',
            'type' => 'order_expired',
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => 'overdue',
            'message' => 'Your order #' . $this->order->order_number . ' expired because the pharmacy closed before it could be fulfilled.',
            'type' => 'order_expired',
        ]);
    }
}
