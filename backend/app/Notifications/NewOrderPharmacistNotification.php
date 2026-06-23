<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Services\Notification\FcmService;


class NewOrderPharmacistNotification extends Notification implements ShouldQueue
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
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Order Received - ' . $this->order->order_number)
            ->greeting('Hello Pharmacist!')
            ->line('A new order #' . $this->order->order_number . ' has been received at your pharmacy.')
            ->line('Customer: ' . ($this->order->customer->user->name ?? 'Guest'))
            ->line('Total Amount: ' . number_format($this->order->total_amount, 2))
            ->action('View and Process Order', url('/pharmacist/orders/' . $this->order->id))
            ->line('Please review and process the order as soon as possible.');
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
                'New Order Received',
                'New order #' . $this->order->order_number . ' received. Please process it.',
                [
                    'order_id' => (string) $this->order->id,
                    'type' => 'new_order_pharmacist',
                ]
            );
        }

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'customer_name' => $this->order->customer->user->name ?? 'Guest',
            'total_amount' => $this->order->total_amount,
            'message' => 'New order #' . $this->order->order_number . ' received.',
            'type' => 'new_order_pharmacist',
        ];
    }
}
