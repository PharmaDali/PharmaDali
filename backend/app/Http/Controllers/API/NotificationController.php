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
        
        return response()->json([
            'status' => 'success',
            'data' => $notifications,
        ]);
    }

    public function unread(Request $request): JsonResponse
    {
        $notifications = $request->user()->unreadNotifications;
        
        return response()->json([
            'status' => 'success',
            'data' => $notifications,
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
