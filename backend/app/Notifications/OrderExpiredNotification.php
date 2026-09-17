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
        $customerName = $notifiable->first_name ?? $notifiable->name ?? 'Valued Customer';

        return (new MailMessage)
            ->subject('Order Expired - #' . $this->order->order_number)
            ->greeting("Hello {$customerName}!")
            ->line('Unfortunately, your order #' . $this->order->order_number . ' could not be fulfilled before pharmacy operating hours closed.')
            ->line(new \Illuminate\Support\HtmlString('
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; background-color: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 8px;">
    <tr>
        <td style="padding: 16px 20px;">
            <div style="font-size: 13px; font-weight: 700; color: #92400e; margin-bottom: 4px;">Order Status: Expired</div>
            <div style="font-size: 13px; color: #78350f;">Orders not completed during pharmacy operating hours expire automatically. You may place a new order during store hours.</div>
        </td>
    </tr>
</table>
'))
            ->line('We sincerely apologize for any inconvenience caused.')
            ->salutation("Warm regards,\nThe PharmaDali Team");
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
