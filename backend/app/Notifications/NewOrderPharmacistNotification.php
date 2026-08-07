<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Services\Notification\FcmService;

class NewOrderPharmacistNotification extends Notification implements ShouldQueue
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
        $customerUser = $this->order->customer?->user;
        $customerName = $customerUser ? trim(($customerUser->first_name ?? '') . ' ' . ($customerUser->last_name ?? '')) : 'Guest';
        if (empty($customerName)) {
            $customerName = 'Guest';
        }

        return (new MailMessage)
            ->subject('New Order Received - ' . $this->order->order_number)
            ->greeting('Hello Pharmacist!')
            ->line('A new order #' . $this->order->order_number . ' has been received at your pharmacy.')
            ->line('Customer: ' . $customerName)
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
        if ($notifiable->fcm_token && !$this->pushSent) {
            $this->pushSent = true;
            try {
                app(FcmService::class)->sendPushNotification(
                    $notifiable,
                    'New Order Received',
                    'New order #' . $this->order->order_number . ' received. Please process it.',
                    [
                        'order_id' => (string) $this->order->id,
                        'type' => 'new_order_pharmacist',
                    ]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('NewOrderPharmacistNotification FCM push error: ' . $e->getMessage());
            }
        }

        $customerUser = $this->order->customer?->user;
        $customerName = $customerUser ? trim(($customerUser->first_name ?? '') . ' ' . ($customerUser->last_name ?? '')) : 'Guest';
        if (empty($customerName)) {
            $customerName = 'Guest';
        }

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'customer_name' => $customerName,
            'total_amount' => $this->order->total_amount,
            'message' => 'New order #' . $this->order->order_number . ' received.',
            'type' => 'new_order_pharmacist',
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $customerUser = $this->order->customer?->user;
        $customerName = $customerUser ? trim(($customerUser->first_name ?? '') . ' ' . ($customerUser->last_name ?? '')) : 'Guest';
        if (empty($customerName)) {
            $customerName = 'Guest';
        }

        return new BroadcastMessage([
            'id' => $this->id,
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'customer_name' => $customerName,
            'total_amount' => $this->order->total_amount,
            'message' => 'New order #' . $this->order->order_number . ' received.',
            'type' => 'new_order_pharmacist',
        ]);
    }
}
