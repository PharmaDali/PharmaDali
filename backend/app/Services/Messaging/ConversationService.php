<?php

namespace App\Services\Messaging;

use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\Order;
use App\Models\User;
use App\Services\Messaging\Actions\AppendSystemMessage;
use App\Services\Messaging\Actions\EnsureConversationForOrder;
use App\Services\Messaging\Actions\ListConversations;
use App\Services\Messaging\Actions\SendChatMessage;
use App\Services\Messaging\Actions\ShowConversation;
use App\Services\Messaging\Actions\StartConversation;
use Illuminate\Http\JsonResponse;

class ConversationService
{
    public function __construct(
        private readonly ListConversations $listConversationsAction,
        private readonly StartConversation $startConversationAction,
        private readonly ShowConversation $showConversationAction,
        private readonly SendChatMessage $sendChatMessageAction,
        private readonly AppendSystemMessage $appendSystemMessageAction,
        private readonly EnsureConversationForOrder $ensureConversationAction
    ) {}

    public function listConversations(User $user): JsonResponse
    {
        return $this->listConversationsAction->execute($user);
    }

    public function listContacts(User $user): JsonResponse
    {
        return $this->listConversationsAction->execute($user);
    }

    public function startConversation(User $user, int $orderId): JsonResponse
    {
        return $this->startConversationAction->execute($user, $orderId);
    }

    public function appendSystemMessage(Order $order, string $body, array $metadata = []): ConversationMessage
    {
        return $this->appendSystemMessageAction->execute($order, $body, $metadata);
    }

    public function showConversation(User $user, Conversation $conversation): JsonResponse
    {
        return $this->showConversationAction->execute($user, $conversation);
    }

    public function sendMessage(User $user, Conversation $conversation, ?string $body, $image = null): JsonResponse
    {
        return $this->sendChatMessageAction->execute($user, $conversation, $body, $image);
    }

    public function ensureConversationForOrder(Order $order): Conversation
    {
        return $this->ensureConversationAction->execute($order);
    }
}