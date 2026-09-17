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

    protected function getNotificationTitle(): string
    {
        return match ($this->issueType) {
            'Prescription' => 'Prescription Items Removed',
            'Receipt'      => 'Customer In-Store Payment Confirmed',
            'ID'           => 'Customer ID Notice Acknowledged',
            default        => 'Customer Acknowledged',
        };
    }

    protected function getNotificationMessage(): string
    {
        if ($this->issueType === 'Prescription') {
            return "Customer removed prescription items from order #{$this->order->order_number} to proceed with OTC items.";
        }
        return "Customer acknowledged the {$this->issueType} issue for order #{$this->order->order_number}.";
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $title = $this->getNotificationTitle();
        $message = $this->getNotificationMessage();

        return (new MailMessage)
            ->subject("{$title} - #{$this->order->order_number}")
            ->greeting('Hello Pharmacist!')
            ->line($message)
            ->line(new \Illuminate\Support\HtmlString('
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; background-color: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #2aabe2; border-radius: 8px;">
    <tr>
        <td style="padding: 16px 20px;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0284c7; margin-bottom: 4px;">Customer Action Recorded</div>
            <div style="font-size: 14px; color: #1e293b;">Order <strong>#' . e($this->order->order_number) . '</strong> has been updated following customer acknowledgment. You may now continue processing.</div>
        </td>
    </tr>
</table>
'))
            ->action('View Order in Dashboard', url('/pharmacist/orders/' . $this->order->id))
            ->salutation("Warm regards,\nThe PharmaDali Team");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $title = $this->getNotificationTitle();
        $message = $this->getNotificationMessage();

        if ($notifiable->fcm_token && !$this->pushSent) {
            $this->pushSent = true;
            try {
                app(FcmService::class)->sendPushNotification(
                    $notifiable,
                    $title,
                    $message,
                    [
                        'order_id' => (string) $this->order->id,
                        'type'     => 'customer_acknowledged',
                    ]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('CustomerAcknowledgedNotification FCM push error: ' . $e->getMessage());
            }
        }

        $customerUser = $this->order->customer?->user;
        $customerName = $customerUser ? trim(($customerUser->first_name ?? '') . ' ' . ($customerUser->last_name ?? '')) : 'Customer';

        return [
            'order_id'      => $this->order->id,
            'order_number'  => $this->order->order_number,
            'customer_name' => $customerName,
            'customer'      => $customerName,
            'title'         => $title,
            'message'       => $message,
            'issue_type'    => $this->issueType,
            'type'          => 'customer_acknowledged',
        ];
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $customerUser = $this->order->customer?->user;
        $customerName = $customerUser ? trim(($customerUser->first_name ?? '') . ' ' . ($customerUser->last_name ?? '')) : 'Customer';

        return new BroadcastMessage([
            'id'            => $this->id,
            'order_id'      => $this->order->id,
            'order_number'  => $this->order->order_number,
            'customer_name' => $customerName,
            'customer'      => $customerName,
            'title'         => $this->getNotificationTitle(),
            'message'       => $this->getNotificationMessage(),
            'issue_type'    => $this->issueType,
            'type'          => 'customer_acknowledged',
            'dateTime'      => now()->format('M. d, Y g:i A'),
            'read_at'       => null,
        ]);
    }
}

