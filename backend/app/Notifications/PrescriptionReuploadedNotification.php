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
        return (new MailMessage)
            ->subject('New Prescription Uploaded - ' . $this->order->order_number)
            ->greeting('Hello Pharmacist!')
            ->line('The customer has uploaded a new prescription for order #' . $this->order->order_number . '.')
            ->action('View Order', url('/pharmacist/orders/' . $this->order->id))
            ->line('Please review the new prescription to proceed with the order.');
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

        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'message' => "Customer uploaded a new prescription for order #{$this->order->order_number}.",
            'type' => 'prescription_reuploaded',
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
            'message' => "Customer uploaded a new prescription for order #{$this->order->order_number}.",
            'type' => 'prescription_reuploaded',
            'dateTime' => now()->format('M. d, Y g:i A'),
            'read_at' => null,
        ]);
    }
}

