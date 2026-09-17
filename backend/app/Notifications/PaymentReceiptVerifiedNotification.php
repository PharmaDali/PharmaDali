<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Services\Notification\FcmService;
use App\Models\Order;

class PaymentReceiptVerifiedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Order $order;
    protected bool $isApproved;
    protected bool $pushSent = false;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order, bool $isApproved)
    {
        $this->order = $order;
        $this->isApproved = $isApproved;
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
     * Get direct, user-friendly title and message.
     */
    private function getNotificationText(): array
    {
        $orderNumber = $this->order->order_number ?? $this->order->id;

        if ($this->isApproved) {
            return [
                'title' => 'Payment Approved',
                'message' => "Your online payment for order #{$orderNumber} has been approved!",
            ];
        }

        return [
            'title' => 'Payment Rejected',
            'message' => "Your payment receipt for order #{$orderNumber} was rejected. Please pay at the pharmacy upon pickup. Would you like to proceed?",
        ];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $text = $this->getNotificationText();
        $customerName = $notifiable->first_name ?? $notifiable->name ?? 'Valued Customer';
        $orderNumber = $this->order->order_number ?? $this->order->id;

        $badgeHtml = $this->isApproved
            ? '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #10b981; border-radius: 8px;"><tr><td style="padding: 14px 18px;"><div style="font-size: 13px; font-weight: 700; color: #166534;">✓ Payment Receipt Approved</div><div style="font-size: 13px; color: #374151; margin-top: 2px;">Your online payment for order #' . e($orderNumber) . ' has been validated and confirmed.</div></td></tr></table>'
            : '<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 8px;"><tr><td style="padding: 14px 18px;"><div style="font-size: 13px; font-weight: 700; color: #991b1b;">✕ Payment Receipt Not Accepted</div><div style="font-size: 13px; color: #7f1d1d; margin-top: 2px;">Please settle payment directly at the pharmacy checkout upon order pickup.</div></td></tr></table>';

        return (new MailMessage)
            ->subject($text['title'] . ' - #' . $orderNumber)
            ->greeting("Hello {$customerName}!")
            ->line($text['message'])
            ->line(new \Illuminate\Support\HtmlString($badgeHtml))
            ->action('View Order Details', url('/orders/' . $this->order->id))
            ->salutation("Warm regards,\nThe PharmaDali Team");
    }

    /**
     * Get the array representation of the notification (database channel).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $text = $this->getNotificationText();

        if ($notifiable->fcm_token && !$this->pushSent) {
            $this->pushSent = true;
            try {
                app(FcmService::class)->sendPushNotification(
                    $notifiable,
                    $text['title'],
                    $text['message'],
                    [
                        'order_id' => (string) $this->order->id,
                        'type' => 'payment_receipt_verification',
                    ]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('PaymentReceiptVerifiedNotification FCM push error: ' . $e->getMessage());
            }
        }

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'title' => $text['title'],
            'message' => $text['message'],
            'type' => 'payment_receipt_verification',
            'is_approved' => $this->isApproved,
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $text = $this->getNotificationText();

        return new BroadcastMessage([
            'id' => $this->id,
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'title' => $text['title'],
            'message' => $text['message'],
            'type' => 'payment_receipt_verification',
            'is_approved' => $this->isApproved,
        ]);
    }
}

