<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;
use App\Services\Notification\FcmService;
use App\Models\Order;

class PrescriptionReuploadedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Order $order;
    protected bool $pushSent = false;

    /**
     * Create a new notification instance.
     *
     * @param Order $order
     */
    public function __construct(Order $order)
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
        $customerName = $customerUser ? trim(($customerUser->first_name ?? '') . ' ' . ($customerUser->last_name ?? '')) : 'Customer';
        if (empty($customerName)) {
            $customerName = 'Customer';
        }

        return (new MailMessage)
            ->subject('New Prescription Uploaded - #' . $this->order->order_number)
            ->greeting('Hello Pharmacist!')
            ->line('A customer has re-uploaded a medical prescription for order #' . $this->order->order_number . '.')
            ->line(new \Illuminate\Support\HtmlString('
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; background-color: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #2aabe2; border-radius: 8px;">
    <tr>
        <td style="padding: 16px 20px;">
            <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #0284c7; margin-bottom: 4px;">Prescription Verification Pending</div>
            <div style="font-size: 14px; color: #1e293b;">Customer <strong>' . e($customerName) . '</strong> submitted a revised prescription for order <strong>#' . e($this->order->order_number) . '</strong>.</div>
        </td>
    </tr>
</table>
'))
            ->action('Review Prescription in Dashboard', url('/pharmacist/orders/' . $this->order->id))
            ->line('Please inspect and verify the prescription image to proceed with fulfillment.')
            ->salutation("Warm regards,\nThe PharmaDali Team");
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
                    'Prescription Re-uploaded',
                    "Customer uploaded a new prescription for order #{$this->order->order_number}.",
                    [
                        'order_id' => (string) $this->order->id,
                        'type' => 'prescription_reuploaded',
                    ]
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('PrescriptionReuploadedNotification FCM push error: ' . $e->getMessage());
            }
        }

        $customerUser = $this->order->customer?->user;
        $customerName = $customerUser ? trim(($customerUser->first_name ?? '') . ' ' . ($customerUser->last_name ?? '')) : 'Customer';

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'customer_name' => $customerName,
            'customer' => $customerName,
            'message' => "Customer uploaded a new prescription for order #{$this->order->order_number}.",
            'type' => 'prescription_reuploaded',
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
            'id' => $this->id,
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'customer_name' => $customerName,
            'customer' => $customerName,
            'message' => "Customer uploaded a new prescription for order #{$this->order->order_number}.",
            'type' => 'prescription_reuploaded',
            'dateTime' => now()->format('M. d, Y g:i A'),
            'read_at' => null,
        ]);
    }
}

