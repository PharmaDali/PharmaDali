<?php

namespace App\Services\Ticket;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Notifications\NewTicketMessageNotification;
use App\Notifications\NewTicketNotification;
use App\Traits\ApiResponseTrait;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;

class TicketService
{
    use ApiResponseTrait;

    /**
     * List and paginate tickets based on user permissions and optional filters.
     */
    public function listTickets(User $user, array $filters = []): LengthAwarePaginator
    {
        $query = Ticket::with(['user:id,first_name,last_name,email', 'assignee:id,first_name,last_name'])
            ->withCount('messages')
            ->latest();

        if (!$user->hasRole('super_admin')) {
            $query->where('user_id', $user->id);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        return $query->paginate(15);
    }

    /**
     * Create a new ticket for the given user, assign a reference ID, and notify super admins.
     */
    public function createTicket(User $user, array $data): Ticket
    {
        // Deduplication throttling: return recent identical ticket if submitted within 10s
        $recentDuplicate = Ticket::where('user_id', $user->id)
            ->where('title', $data['title'])
            ->where('created_at', '>=', now()->subSeconds(10))
            ->first();

        if ($recentDuplicate) {
            return $recentDuplicate;
        }

        if (empty($data['ticket_reference_id'])) {
            $data['ticket_reference_id'] = $this->generateTicketReferenceId();
        }

        $ticket = $user->tickets()->create($data);

        // Notify super admins
        $superAdmins = User::where('role', 'super_admin')->get();
        if ($superAdmins->isNotEmpty()) {
            Notification::send($superAdmins, new NewTicketNotification($ticket));
        }

        return $ticket;
    }

    /**
     * Fetch detailed ticket info with user and messages relationships after checking access permission.
     */
    public function getTicketDetails(User $user, Ticket $ticket): Ticket
    {
        if (!$user->hasRole('super_admin') && $ticket->user_id !== $user->id) {
            throw new HttpResponseException(
                $this->errorResponse('Unauthorized', 403)
            );
        }

        return $ticket->load(['user:id,first_name,last_name,email', 'messages.user:id,first_name,last_name,email,role']);
    }

    /**
     * Update ticket status.
     */
    public function updateTicketStatus(User $user, Ticket $ticket, string $status): Ticket
    {
        $ticket->update(['status' => $status]);
        return $ticket->fresh();
    }

    /**
     * Add a message to a ticket with optional image attachment and send real-time notification.
     */
    public function addTicketMessage(User $user, Ticket $ticket, array $data, ?UploadedFile $file = null): TicketMessage
    {
        $attachmentPath = null;
        if ($file) {
            $attachmentPath = $file->store('ticket-attachments', 'public');
        }

        $message = $ticket->messages()->create([
            'user_id'         => $user->id,
            'message'         => $data['message'] ?? null,
            'attachment_path' => $attachmentPath,
        ]);

        $message->load('user:id,first_name,last_name,email,role');

        // Notify recipient party
        if ($user->hasRole('super_admin')) {
            $ticket->user->notify(new NewTicketMessageNotification($message));
        } else {
            $superAdmins = User::where('role', 'super_admin')->get();
            if ($superAdmins->isNotEmpty()) {
                Notification::send($superAdmins, new NewTicketMessageNotification($message));
            }
        }

        return $message;
    }

    /**
     * Generate a unique ticket reference ID formatted as TICK-YYYYMMDD-XXXX.
     */
    public function generateTicketReferenceId(): string
    {
        $dateStr = now()->format('Ymd');

        do {
            $random = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));
            $refId  = "TICK-{$dateStr}-{$random}";
        } while (Ticket::where('ticket_reference_id', $refId)->exists());

        return $refId;
    }
}
