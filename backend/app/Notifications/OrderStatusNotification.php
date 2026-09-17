<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Services\Notification\FcmService;

class OrderStatusNotification extends Notification implements ShouldQueue
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
     * Get direct, user-friendly title and message based on exact order status.
     */
    private function getNotificationText(): array
    {
        $status = strtolower((string) ($this->order->status?->value ?? ''));
        $orderNumber = $this->order->order_number ?? $this->order->id;

        return match ($status) {
            'preparing' => [
                'title' => 'Order Being Prepared',
                'message' => "Your order #{$orderNumber} is now being prepared by the pharmacist.",
            ],
            'ready_for_pickup' => [
                'title' => 'Ready for Pickup!',
                'message' => "Your order #{$orderNumber} is ready for pickup! Please visit the pharmacy to collect your items.",
            ],
            'stand_by' => [
                'title' => 'Order On Hold',
                'message' => "Your order #{$orderNumber} has been placed on hold. Please check your order details or messages.",
            ],
            'cancelled', 'rejected' => [
                'title' => 'Order Cancelled',
                'message' => "Your order #{$orderNumber} has been cancelled.",
            ],
            'completed' => [
                'title' => 'Order Completed',
                'message' => "Your order #{$orderNumber} has been completed. Thank you for choosing PharmaDali!",
            ],
            default => [
                'title' => 'Order Updated',
                'message' => "Your order #{$orderNumber} status is now " . str_replace('_', ' ', $status) . ".",
            ],
        };
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $text = $this->getNotificationText();
        $customerName = $notifiable->first_name ?? $notifiable->name ?? 'Valued Customer';
        $statusFormatted = ucwords(str_replace('_', ' ', $this->order->order_status ?? 'Updated'));

        return (new MailMessage)
            ->subject($text['title'] . ' - #' . $this->order->order_number)
            ->greeting("Hello {$customerName}!")
            ->line($text['message'])
            ->line(new \Illuminate\Support\HtmlString('
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; background-color: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #2aabe2; border-radius: 8px;">
    <tr>
        <td style="padding: 14px 18px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                    <td style="font-size: 13px; color: #0284c7; font-weight: 600; text-transform: uppercase;">Order #' . e($this->order->order_number) . '</td>
                    <td align="right"><span style="display: inline-block; background-color: #2aabe2; color: #ffffff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">' . e($statusFormatted) . '</span></td>
                </tr>
            </table>
        </td>
    </tr>
</table>
'))
            ->action('View Order Details', url('/orders/' . $this->order->id))
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
            'title' => $text['title'],
            'message' => $text['message'],
            'type' => 'order_status_change',
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
            'status' => $this->order->status,
            'title' => $text['title'],
            'message' => $text['message'],
            'type' => 'order_status_change',
        ]);
    }
}
