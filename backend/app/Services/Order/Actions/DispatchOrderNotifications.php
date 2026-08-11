<?php

namespace App\Services\Order\Actions;

use App\Models\Order;
use App\Models\Pharmacy;
use App\Models\User;
use App\Services\Messaging\ConversationService;
use App\Notifications\OrderPlacedNotification;
use App\Notifications\NewOrderPharmacistNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Log;

class DispatchOrderNotifications
{
    public function __construct(
        private readonly ConversationService $conversationService,
    ) {}

    /**
     * Register terminating callback to dispatch order notifications and system message after response is sent.
     */
    public function execute(User $user, Order $order, Pharmacy $pharmacy): void
    {
        app()->terminating(function () use ($user, $order, $pharmacy) {
            try {
                $user->notify(new OrderPlacedNotification($order));
                $pharmacists = $pharmacy->pharmacists;
                if ($pharmacists && $pharmacists->isNotEmpty()) {
                    Notification::send($pharmacists, new NewOrderPharmacistNotification($order));
                }
            } catch (\Throwable $notifException) {
                Log::warning('Order notification dispatch error (order placed successfully): ' . $notifException->getMessage());
            }

            try {
                $this->conversationService->appendSystemMessage($order, 'Order received', [
                    'status' => $order->status,
                    'order_number' => $order->order_number,
                ]);
            } catch (\Throwable $broadcastException) {
                Log::warning('Order system message broadcast failed (order still placed): ' . $broadcastException->getMessage());
            }
        });
    }
}
