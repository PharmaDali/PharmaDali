<?php

namespace App\Services\Messaging\Actions;

use App\Events\ConversationMessageCreated;
use App\Models\ConversationMessage;
use App\Models\Order;
use App\Repositories\ConversationRepository;

class AppendSystemMessage
{
    public function __construct(
        private readonly ConversationRepository $conversationRepository,
        private readonly EnsureConversationForOrder $ensureConversationAction
    ) {}

    public function execute(Order $order, string $body, array $metadata = []): ConversationMessage
    {
        $conversation = $this->ensureConversationAction->execute($order);
        $message = $this->conversationRepository->createSystemMessage($conversation, $body, $metadata);

        event(new ConversationMessageCreated($message));

        return $message;
    }
}
