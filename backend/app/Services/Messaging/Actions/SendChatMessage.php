<?php

namespace App\Services\Messaging\Actions;

use App\Events\ConversationMessageCreated;
use App\Models\Conversation;
use App\Models\User;
use App\Repositories\ConversationRepository;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class SendChatMessage
{
    use ApiResponseTrait;

    public function __construct(
        private readonly ConversationRepository $conversationRepository,
        private readonly DispatchChatMessagePushNotification $dispatchPushNotificationAction
    ) {}

    public function execute(User $user, Conversation $conversation, ?string $body, $image = null): JsonResponse
    {
        if (!$this->userCanParticipateInConversation($user, $conversation)) {
            return $this->errorResponse('You are not allowed to send messages in this conversation.', 403);
        }

        $body = $body !== null ? trim($body) : '';

        if ($body === '' && !$image) {
            return $this->errorResponse('Message body or image is required.', 422);
        }

        $metadata = null;
        if ($image) {
            $path = $image->store('chat_images', 'public');
            $metadata = [
                'image_url' => asset('storage/' . $path),
                'image_path' => $path,
            ];
        }

        $message = $this->conversationRepository->createMessage(
            conversation: $conversation,
            user: $user,
            body: $body,
            metadata: $metadata,
            type: $image ? 'image' : 'user'
        );

        event(new ConversationMessageCreated($message));

        $this->dispatchPushNotificationAction->execute($message, $user, $conversation);

        return $this->successResponse(
            $message->load('sender:id,first_name,last_name,role'),
            'Message sent successfully.',
            201
        );
    }

    private function userCanParticipateInConversation(User $user, Conversation $conversation): bool
    {
        if ((int) $conversation->customer_user_id === (int) $user->id) {
            return $user->role === 'customer';
        }

        if (in_array($user->role, ['pharmacist', 'pharmacy_admin'], true)) {
            if ($conversation->assigned_pharmacist_user_id && (int) $conversation->assigned_pharmacist_user_id === (int) $user->id) {
                return true;
            }

            return $user->pharmacy_id !== null && (int) $user->pharmacy_id === (int) $conversation->pharmacy_id;
        }

        return false;
    }
}
