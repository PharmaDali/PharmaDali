<?php

namespace App\Services\Messaging\Actions;

use App\Models\User;
use App\Repositories\ConversationRepository;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class ListConversations
{
    use ApiResponseTrait;

    public function __construct(
        private readonly ConversationRepository $conversationRepository
    ) {}

    public function execute(User $user): JsonResponse
    {
        $conversations = $this->conversationRepository->getConversationsForUser($user);

        return $this->successResponse($conversations);
    }
}
