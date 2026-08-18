<?php

namespace App\Services\Messaging\Actions;

use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\User;
use App\Repositories\ConversationRepository;
use App\Services\Notification\FcmService;
use Illuminate\Support\Facades\Log;

class DispatchChatMessagePushNotification
{
    public function __construct(
        private readonly ConversationRepository $conversationRepository
    ) {}

    public function execute(ConversationMessage $message, User $sender, Conversation $conversation): void
    {
        try {
            /** @var FcmService $fcmService */
            $fcmService = app(FcmService::class);

            $previewBody = $message->message_type === 'image'
                ? 'Sent an image'
                : ($message->body ?? 'New message');

            $pushData = [
                'type' => 'chat',
                'conversation_id' => (string) $conversation->id,
                'order_id' => (string) $conversation->order_id,
                'sender_id' => (string) $sender->id,
            ];

            if ($sender->role === 'customer') {
                // Customer sent message -> Notify Pharmacists & Pharmacy Admins of the pharmacy
                $senderName = trim(($sender->first_name ?? '') . ' ' . ($sender->last_name ?? 'Customer'));
                $title = "New message from " . ($senderName ?: 'Customer');

                $pharmacists = $this->conversationRepository->getPharmacyPharmacistsWithTokens($conversation->pharmacy_id);

                foreach ($pharmacists as $pharmacist) {
                    if ((int) $pharmacist->id !== (int) $sender->id) {
                        $fcmService->sendPushNotification($pharmacist, $title, $previewBody, $pushData);
                    }
                }
            } else {
                // Pharmacist sent message -> Notify Customer
                $pharmacyName = $conversation->pharmacy?->pharmacy_name ?? 'Pharmacy';
                $title = "New message from " . $pharmacyName;

                if ($conversation->customer_user_id) {
                    $customerUser = $this->conversationRepository->getCustomerUserWithToken($conversation->customer_user_id);

                    if ($customerUser && (int) $customerUser->id !== (int) $sender->id) {
                        $fcmService->sendPushNotification($customerUser, $title, $previewBody, $pushData);
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::error('Failed to dispatch chat FCM push notification: ' . $e->getMessage());
        }
    }
}
