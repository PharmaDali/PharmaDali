<?php

namespace App\Notifications;

use App\Models\TicketMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class NewTicketMessageNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public TicketMessage $ticketMessage)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'System Alert',
            'title' => 'New Ticket Reply',
            'message' => $this->ticketMessage->user->first_name . ' replied to your ticket.',
            'ticket_id' => $this->ticketMessage->ticket_id,
            'ticket_reference_id' => $this->ticketMessage->ticket?->ticket_reference_id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'type' => 'System Alert',
            'title' => 'New Ticket Reply',
            'message' => $this->ticketMessage->user->first_name . ' replied to your ticket.',
            'ticket_id' => $this->ticketMessage->ticket_id,
            'ticket_reference_id' => $this->ticketMessage->ticket?->ticket_reference_id,
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ]);
    }
}