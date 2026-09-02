<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketMessageRequest;
use App\Models\Ticket;
use App\Notifications\NewTicketMessageNotification;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class TicketMessageController extends Controller
{
    use ApiResponseTrait;

    public function store(StoreTicketMessageRequest $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        
        $attachmentPath = null;
        if ($request->hasFile('image')) {
            $attachmentPath = $request->file('image')->store('ticket-attachments', 'public');
        }

        $message = $ticket->messages()->create([
            'user_id' => $user->id,
            'message' => $validated['message'] ?? null,
            'attachment_path' => $attachmentPath,
        ]);
        
        $message->load('user:id,first_name,last_name,email,role');

        // Notify the other party
        if ($user->hasRole('super_admin')) {
            $ticket->user->notify(new NewTicketMessageNotification($message));
        } else {
            // If pharmacy admin replied, notify super admins (for simplicity we notify all, or we could track who replied last)
            $superAdmins = \App\Models\User::where('role', 'super_admin')->get();
            \Illuminate\Support\Facades\Notification::send($superAdmins, new NewTicketMessageNotification($message));
        }

        return $this->successResponse($message, 'Message added successfully', 201);
    }
}