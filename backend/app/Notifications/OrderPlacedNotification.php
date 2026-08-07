<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Services\Notification\FcmService;

class OrderPlacedNotification extends Notification implements ShouldQueue
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
            ->subject('Order Confirmation - ' . $this->order->order_number)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Thank you for your order! We have received your order #' . $this->order->order_number . '.')
            ->line('Total Amount: ' . number_format($this->order->total_amount, 2))
            ->line('Payment Method: ' . ucfirst($this->order->payment_method))
            ->action('Track Your Order', url('/orders/' . $this->order->id))
            ->line('We will notify you once your order is ready for pickup.');
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
                    'Order Placed Successfully',
                    'Your order #' . $this->order->order_number . ' has been received.',
                    [
                        'order_id' => (string) $this->order->id,
                        'type' => 'order_placed',
                    ]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('OrderPlacedNotification FCM push error: ' . $e->getMessage());
            }
        }

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'total_amount' => $this->order->total_amount,
            'message' => 'Your order #' . $this->order->order_number . ' has been successfully placed.',
            'type' => 'order_placed',
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
            'total_amount' => $this->order->total_amount,
            'message' => 'Your order #' . $this->order->order_number . ' has been successfully placed.',
            'type' => 'order_placed',
        ]);
    }
}
