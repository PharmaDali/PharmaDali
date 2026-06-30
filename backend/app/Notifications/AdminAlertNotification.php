<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AdminAlertNotification extends Notification
{
    use Queueable;

    private string $alertType;
    private string $message;
    private array $extraData;

    /**
     * Create a new notification instance.
     *
     * @param string $alertType "Low Stocks" | "Expiry Warning" | "Shortage Alert" | "System Alert"
     * @param string $message
     * @param array $extraData
     */
    public function __construct(string $alertType, string $message, array $extraData = [])
    {
        $this->alertType = $alertType;
        $this->message = $message;
        $this->extraData = $extraData;
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
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return array_merge([
            'type' => $this->alertType,
            'message' => $this->message,
        ], $this->extraData);
    }

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): \Illuminate\Notifications\Messages\BroadcastMessage
    {
        return new \Illuminate\Notifications\Messages\BroadcastMessage([
            'id' => $this->id,
            'type' => $this->alertType,
            'message' => $this->message,
            'dateTime' => now()->format('M. d, Y g:i A'),
            'read_at' => null,
        ]);
    }
}
