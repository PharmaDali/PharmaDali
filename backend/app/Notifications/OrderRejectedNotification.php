<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Services\Notification\FcmService;

class OrderRejectedNotification extends Notification implements ShouldQueue
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
            ->subject('Order Rejected - ' . $this->order->order_number)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Your order #' . $this->order->order_number . ' has been rejected by the pharmacist.')
            ->line('Reason: ' . ($this->order->cancellation_reason ?? 'No reason provided.'))
            ->line('We apologize for the inconvenience.');
    }

    public function toArray(object $notifiable): array
    {
        $reason = $this->order->cancellation_reason ?? 'No reason provided.';
        $cleanReason = str_replace('Rejected by pharmacist: ', '', $reason);

        if ($notifiable->fcm_token) {
            app(FcmService::class)->sendPushNotification(
                $notifiable,
                'Order Rejected',
                'Your order #' . $this->order->order_number . ' was rejected by the pharmacist: ' . $cleanReason,
                [
                    'order_id' => (string) $this->order->id,
                    'type' => 'order_rejected',
                ]
            );
        }

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => 'cancelled',
            'message' => 'Your order #' . $this->order->order_number . ' was rejected by the pharmacist: ' . $cleanReason,
            'type' => 'order_rejected',
        ];
    }
}
