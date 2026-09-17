<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Services\Notification\FcmService;

class OrderRejectedNotification extends Notification implements ShouldQueue
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
        $reason = $this->order->cancellation_reason ?? 'No reason provided.';
        $cleanReason = str_replace('Rejected by pharmacist: ', '', $reason);

        return (new MailMessage)
            ->subject('Order Update - #' . $this->order->order_number)
            ->greeting("Hello {$customerName}!")
            ->line('We regret to inform you that your order #' . $this->order->order_number . ' could not be fulfilled by the pharmacy.')
            ->line(new \Illuminate\Support\HtmlString('
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 8px;">
    <tr>
        <td style="padding: 16px 20px;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #991b1b; margin-bottom: 4px;">Reason for Order Rejection</div>
            <div style="font-size: 14px; color: #7f1d1d; font-weight: 500;">' . e($cleanReason) . '</div>
        </td>
    </tr>
</table>
'))
            ->line('We apologize for any inconvenience. If you have questions or wish to place a replacement order, please contact our support team or visit your local branch.')
            ->salutation("Warm regards,\nThe PharmaDali Team");
    }

    public function toArray(object $notifiable): array
    {
        $reason = $this->order->cancellation_reason ?? 'No reason provided.';
        $cleanReason = str_replace('Rejected by pharmacist: ', '', $reason);

        if ($notifiable->fcm_token && !$this->pushSent) {
            $this->pushSent = true;
            try {
                app(FcmService::class)->sendPushNotification(
                    $notifiable,
                    'Order Rejected',
                    'Your order #' . $this->order->order_number . ' was rejected by the pharmacist: ' . $cleanReason,
                    [
                        'order_id' => (string) $this->order->id,
                        'type' => 'order_rejected',
                    ]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('OrderRejectedNotification FCM push error: ' . $e->getMessage());
            }
        }

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => 'cancelled',
            'message' => 'Your order #' . $this->order->order_number . ' was rejected by the pharmacist: ' . $cleanReason,
            'type' => 'order_rejected',
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $reason = $this->order->cancellation_reason ?? 'No reason provided.';
        $cleanReason = str_replace('Rejected by pharmacist: ', '', $reason);

        return new BroadcastMessage([
            'id' => $this->id,
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'status' => 'cancelled',
            'message' => 'Your order #' . $this->order->order_number . ' was rejected by the pharmacist: ' . $cleanReason,
            'type' => 'order_rejected',
        ]);
    }
}
