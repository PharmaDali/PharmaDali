<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()->paginate(20);
        
        $formatted = collect($notifications->items())->map(function ($notif) {
            $data = $notif->data;
            return [
                'id' => $notif->id,
                'type' => $data['type'] ?? 'System Alert',
                'message' => $data['message'] ?? '',
                'dateTime' => $notif->created_at ? $notif->created_at->format('M. d, Y g:i A') : '',
                'read_at' => $notif->read_at,
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
        
        $formatted = collect($notifications)->map(function ($notif) {
            $data = $notif->data;
            return [
                'id' => $notif->id,
                'type' => $data['type'] ?? 'System Alert',
                'message' => $data['message'] ?? '',
                'dateTime' => $notif->created_at ? $notif->created_at->format('M. d, Y g:i A') : '',
                'read_at' => $notif->read_at,
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
}
