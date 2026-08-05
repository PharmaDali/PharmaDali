<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Services\Notification\FcmService;

class OrderStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;

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
        $status = str_replace('_', ' ', $this->order->status);

        return (new MailMessage)
            ->subject('Order Status Updated - ' . $this->order->order_number)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('The status of your order ' . $this->order->order_number . ' has been updated to: ' . strtoupper($status) . '.')
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
        $isCancelled = $this->order->status === 'cancelled';
        $title = $isCancelled ? 'Order Cancelled' : 'Order Status Updated';
        $message = $isCancelled
            ? 'Your order #' . $this->order->order_number . ' has been cancelled.'
            : 'Your order #' . $this->order->order_number . ' status is now ' . str_replace('_', ' ', $this->order->status) . '.';

        if ($notifiable->fcm_token) {
            try {
                app(FcmService::class)->sendPushNotification(
                    $notifiable,
                    $title,
                    $message,
                    [
                        'order_id' => (string) $this->order->id,
                        'type' => 'order_status_change',
                    ]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('OrderStatusNotification FCM push error: ' . $e->getMessage());
            }
        }

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => $this->order->status,
            'message' => $message,
            'type' => 'order_status_change',
        ];
    }
}
