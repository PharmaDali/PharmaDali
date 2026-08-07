<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Services\Notification\FcmService;

class OrderCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;
    protected bool $pushSent = false;

    /**
     * Create a new notification instance.
     */
    public function __construct($order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Order Completed - ' . $this->order->order_number)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Great news! Your order #' . $this->order->order_number . ' has been marked as completed.')
            ->line('We hope you are satisfied with our service.')
            ->action('View Order Details', url('/orders/' . $this->order->id))
            ->line('Thank you for choosing PharmaDali!');
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
                    'Order Completed',
                    'Your order #' . $this->order->order_number . ' has been marked as completed. Thank you!',
                    [
                        'order_id' => (string) $this->order->id,
                        'type' => 'order_completed',
                    ]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('OrderCompletedNotification FCM push error: ' . $e->getMessage());
            }
        }

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => 'completed',
            'message' => 'Your order #' . $this->order->order_number . ' has been completed. Thank you!',
            'type' => 'order_completed',
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
            'status' => 'completed',
            'message' => 'Your order #' . $this->order->order_number . ' has been completed. Thank you!',
            'type' => 'order_completed',
        ]);
    }
}
