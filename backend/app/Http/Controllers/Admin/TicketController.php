<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Models\Ticket;
use App\Models\User;
use App\Notifications\NewTicketNotification;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class TicketController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = Ticket::with(['user:id,first_name,last_name,email', 'assignee:id,first_name,last_name'])
            ->withCount('messages')
            ->latest();

        if (!$user->hasRole('super_admin')) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        return $this->successResponse($query->paginate(15));
    }

    public function store(StoreTicketRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        
        $ticket = $user->tickets()->create($validated);
        
        // Notify super admins
        $superAdmins = User::where('role', 'super_admin')->get();
        Notification::send($superAdmins, new NewTicketNotification($ticket));

        return $this->successResponse($ticket, 'Ticket created successfully', 201);
    }

    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->hasRole('super_admin') && $ticket->user_id !== $user->id) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $ticket->load(['user:id,first_name,last_name,email', 'messages.user:id,first_name,last_name,email,role']);

        return $this->successResponse($ticket);
    }

    public function updateStatus(Request $request, Ticket $ticket): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->hasRole('super_admin')) {
            return $this->errorResponse('Unauthorized', 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:open,in_progress,resolved,closed']
        ]);

        $ticket->update(['status' => $validated['status']]);

        return $this->successResponse($ticket, 'Ticket status updated successfully');
    }
}