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
            ->subject("{$title} - {$this->order->order_number}")
            ->greeting('Hello Pharmacist!')
            ->line($message)
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

