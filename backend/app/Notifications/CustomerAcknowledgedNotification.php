<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Services\Notification\FcmService;
use App\Models\Order;

class CustomerAcknowledgedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Order $order;
    protected string $issueType; // 'ID' or 'Receipt'
    protected bool $pushSent = false;

    /**
     * Create a new notification instance.
     *
     * @param Order $order
     * @param string $issueType e.g., 'ID' or 'Receipt'
     */
    public function __construct(Order $order, string $issueType = 'ID')
    {
        $this->order = $order;
        $this->issueType = $issueType;
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
            ->subject('Customer Acknowledged Issue - ' . $this->order->order_number)
            ->greeting('Hello Pharmacist!')
            ->line("The customer has acknowledged the {$this->issueType} rejection for order #" . $this->order->order_number . ".")
            ->action('View Order', url('/pharmacist/orders/' . $this->order->id))
            ->line('You may now proceed with processing this order.');
    }

    /**
     * Get the array representation of the notification.
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
                    'Customer Acknowledged',
                    "Customer acknowledged the {$this->issueType} issue for order #" . $this->order->order_number . ".",
                    [
                        'order_id' => (string) $this->order->id,
                        'type' => 'customer_acknowledged',
                    ]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('CustomerAcknowledgedNotification FCM push error: ' . $e->getMessage());
            }
        }

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'message' => "Customer acknowledged the {$this->issueType} issue for order #{$this->order->order_number}.",
            'type' => 'customer_acknowledged',
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
            'message' => "Customer acknowledged the {$this->issueType} issue for order #{$this->order->order_number}.",
            'type' => 'customer_acknowledged',
            'dateTime' => now()->format('M. d, Y g:i A'),
            'read_at' => null,
        ]);
    }
}

