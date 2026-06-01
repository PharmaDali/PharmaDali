<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderStatusNotification extends Notification
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
        $status = str_replace('_', ' ', $this->order->status);
        
        return (new MailMessage)
            ->subject('Order Status Updated - ' . $this->order->order_number)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('The status of your order ' . $this->order->order_number . ' has been updated to: ' . strtoupper($status) . '.')
            ->action('View Order Details', url('/orders/' . $this->order->id))
            ->line('Thank you for choosing PharmaDali!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => $this->order->status,
            'message' => 'Your order #' . $this->order->order_number . ' status is now ' . str_replace('_', ' ', $this->order->status) . '.',
            'type' => 'order_status_change'
        ];
    }
}
