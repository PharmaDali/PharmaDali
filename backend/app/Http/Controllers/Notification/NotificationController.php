<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class NotificationController extends Controller
{
    private function formatNotifications($notificationCollection): Collection
    {
        $ticketIds = collect($notificationCollection)
            ->pluck('data.ticket_id')
            ->filter()
            ->unique();

        $tickets = Ticket::whereIn('id', $ticketIds)->pluck('ticket_reference_id', 'id');

        $orderIds = collect($notificationCollection)
            ->pluck('data.order_id')
            ->filter()
            ->unique();

        $orders = Order::with(['customer.user', 'pharmacy'])
            ->whereIn('id', $orderIds)
            ->get()
            ->keyBy('id');

        return collect($notificationCollection)->map(function ($notif) use ($tickets, $orders) {
            $data = $notif->data ?? [];

            if (!empty($data['ticket_id']) && empty($data['ticket_reference_id'])) {
                $data['ticket_reference_id'] = $tickets[$data['ticket_id']] ?? null;
            }

            if (!empty($data['order_id']) && isset($orders[$data['order_id']])) {
                $order = $orders[$data['order_id']];
                $customerUser = $order->customer?->user;
                $customerFullName = $customerUser ? trim(($customerUser->first_name ?? '') . ' ' . ($customerUser->last_name ?? '')) : null;

                if (!empty($customerFullName)) {
                    $data['customer_name'] = $data['customer_name'] ?? $customerFullName;
                    $data['customer'] = $data['customer'] ?? $customerFullName;
                    $data['customer_first_name'] = $data['customer_first_name'] ?? $customerUser->first_name;
                }

                if ($order->pharmacy) {
                    $data['pharmacy_name'] = $data['pharmacy_name'] ?? ($order->pharmacy->pharmacy_name ?? $order->pharmacy->name);
                    $data['location'] = $data['location'] ?? ($order->pharmacy->location ?? $order->pharmacy->city ?? $order->pharmacy->address);
                }

                if (!empty($order->order_number)) {
                    $data['order_number'] = $data['order_number'] ?? $order->order_number;
                }

                if (!empty($order->status)) {
                    $data['status'] = $data['status'] ?? $order->status;
                }

                if (!empty($order->placed_at) || !empty($order->created_at)) {
                    $data['order_date'] = $data['order_date'] ?? ($order->placed_at ? $order->placed_at->toIso8601String() : $order->created_at?->toIso8601String());
                }
            }

            return [
                'id' => $notif->id,
                'type' => $data['type'] ?? 'System Alert',
                'title' => $data['title'] ?? null,
                'message' => $data['message'] ?? '',
                'customer_name' => $data['customer_name'] ?? null,
                'customer' => $data['customer'] ?? ($data['customer_name'] ?? null),
                'order_id' => $data['order_id'] ?? null,
                'order_number' => $data['order_number'] ?? null,
                'status' => $data['status'] ?? null,
                'pharmacy_name' => $data['pharmacy_name'] ?? null,
                'location' => $data['location'] ?? null,
                'order_date' => $data['order_date'] ?? null,
                'dateTime' => $notif->created_at ? $notif->created_at->format('M. d, Y g:i A') : '',
                'created_at' => $notif->created_at ? $notif->created_at->toIso8601String() : null,
                'read_at' => $notif->read_at,
                'data' => $data,
            ];
        });
    }

    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->notifications()->paginate(20);
        $formatted = $this->formatNotifications($notifications->items());

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
        $formatted = $this->formatNotifications($notifications);

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
