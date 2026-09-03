<?php

namespace App\Notifications;

use App\Models\Ticket;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class NewTicketNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Ticket $ticket)
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
            'title' => 'New Support Ticket Created',
            'message' => 'A new ' . $this->ticket->category . ' ticket was created by ' . $this->ticket->user->first_name . ' ' . $this->ticket->user->last_name . '.',
            'ticket_id' => $this->ticket->id,
            'ticket_reference_id' => $this->ticket->ticket_reference_id,
            'priority' => $this->ticket->priority,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'type' => 'System Alert',
            'title' => 'New Support Ticket Created',
            'message' => 'A new ' . $this->ticket->category . ' ticket was created by ' . $this->ticket->user->first_name . ' ' . $this->ticket->user->last_name . '.',
            'ticket_id' => $this->ticket->id,
            'ticket_reference_id' => $this->ticket->ticket_reference_id,
            'priority' => $this->ticket->priority,
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ]);
    }
}