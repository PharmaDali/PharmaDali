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
        $customerName = $notifiable->first_name ?? $notifiable->name ?? 'Valued Customer';
        $paymentMethod = ucwords(str_replace('_', ' ', $this->order->payment_method ?? 'Cash'));

        return (new MailMessage)
            ->subject('Order Confirmation - #' . $this->order->order_number)
            ->greeting("Hello {$customerName}!")
            ->line('Thank you for choosing PharmaDali. We have received your order and our pharmacy team is currently processing it.')
            ->line(new \Illuminate\Support\HtmlString('
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;">
    <tr>
        <td style="padding: 14px 20px; border-bottom: 1px solid #e2e8f0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                    <td style="font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</td>
                    <td align="right" style="font-family: \'Courier New\', Courier, monospace; font-size: 15px; font-weight: 700; color: #0284c7;">#' . e($this->order->order_number) . '</td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td style="padding: 16px 20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                    <td style="font-size: 14px; color: #475569; padding-bottom: 8px;">Payment Method</td>
                    <td align="right" style="font-size: 14px; font-weight: 600; color: #1e293b; padding-bottom: 8px;">' . e($paymentMethod) . '</td>
                </tr>
                <tr>
                    <td style="font-size: 15px; font-weight: 700; color: #0f172a; padding-top: 8px; border-top: 1px dashed #cbd5e1;">Total Amount</td>
                    <td align="right" style="font-size: 18px; font-weight: 800; color: #2aabe2; padding-top: 8px; border-top: 1px dashed #cbd5e1;">₱' . number_format((float) $this->order->total_amount, 2) . '</td>
                </tr>
            </table>
        </td>
    </tr>
</table>
'))
            ->action('Track Order Status', url('/orders/' . $this->order->id))
            ->line('We will notify you as soon as your items are verified and ready for pickup.')
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
