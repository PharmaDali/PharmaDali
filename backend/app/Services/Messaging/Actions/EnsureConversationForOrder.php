<?php

namespace App\Services\Messaging\Actions;

use App\Models\Conversation;
use App\Models\Order;
use App\Models\User;
use App\Repositories\ConversationRepository;

class EnsureConversationForOrder
{
    public function __construct(
        private readonly ConversationRepository $conversationRepository
    ) {}

    public function execute(Order $order): Conversation
    {
        return $this->conversationRepository->ensureConversationForOrder($order);
    }

    public function upsertParticipant(Conversation $conversation, User $user, string $role): void
    {
        $this->conversationRepository->upsertParticipant($conversation, $user, $role);
    }
}
