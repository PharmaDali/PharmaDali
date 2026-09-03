<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()->paginate(20);

        $ticketIds = collect($notifications->items())
            ->pluck('data.ticket_id')
            ->filter()
            ->unique();

        $tickets = Ticket::whereIn('id', $ticketIds)->pluck('ticket_reference_id', 'id');
        
        $formatted = collect($notifications->items())->map(function ($notif) use ($tickets) {
            $data = $notif->data ?? [];
            if (!empty($data['ticket_id']) && empty($data['ticket_reference_id'])) {
                $data['ticket_reference_id'] = $tickets[$data['ticket_id']] ?? null;
            }

            return [
                'id' => $notif->id,
                'type' => $data['type'] ?? 'System Alert',
                'message' => $data['message'] ?? '',
                'dateTime' => $notif->created_at ? $notif->created_at->format('M. d, Y g:i A') : '',
                'created_at' => $notif->created_at ? $notif->created_at->toIso8601String() : null,
                'read_at' => $notif->read_at,
                'data' => $data,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formatted,
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ]
        ]);
    }

    public function unread(Request $request): JsonResponse
    {
        $notifications = $request->user()->unreadNotifications;
        
        $ticketIds = collect($notifications)
            ->pluck('data.ticket_id')
            ->filter()
            ->unique();

        $tickets = Ticket::whereIn('id', $ticketIds)->pluck('ticket_reference_id', 'id');

        $formatted = collect($notifications)->map(function ($notif) use ($tickets) {
            $data = $notif->data ?? [];
            if (!empty($data['ticket_id']) && empty($data['ticket_reference_id'])) {
                $data['ticket_reference_id'] = $tickets[$data['ticket_id']] ?? null;
            }

            return [
                'id' => $notif->id,
                'type' => $data['type'] ?? 'System Alert',
                'message' => $data['message'] ?? '',
                'dateTime' => $notif->created_at ? $notif->created_at->format('M. d, Y g:i A') : '',
                'created_at' => $notif->created_at ? $notif->created_at->toIso8601String() : null,
                'read_at' => $notif->read_at,
                'data' => $data,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formatted,
        ]);
    }

    public function markAsRead(Request $request, $id): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Notification marked as read',
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();
        
        return response()->json([
            'status' => 'success',
            'message' => 'All notifications marked as read',
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Notification deleted',
        ]);
    }

    public function deleteAll(Request $request): JsonResponse
    {
        $request->user()->notifications()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'All notifications deleted successfully',
        ]);
    }
}
