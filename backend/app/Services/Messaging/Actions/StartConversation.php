<?php

namespace App\Services\Messaging\Actions;

use App\Models\Conversation;
use App\Models\Order;
use App\Models\User;
use App\Repositories\ConversationRepository;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class StartConversation
{
    use ApiResponseTrait;

    public function __construct(
        private readonly ConversationRepository $conversationRepository,
        private readonly EnsureConversationForOrder $ensureConversationAction
    ) {}

    public function execute(User $user, int $orderId): JsonResponse
    {
        $order = $this->conversationRepository->findOrderById($orderId);

        if (!$order) {
            return $this->errorResponse('Order not found.', 404);
        }

        if (!$this->userCanAccessOrderConversation($user, $order)) {
            return $this->errorResponse('You are not allowed to open this conversation.', 403);
        }

        $conversation = $this->ensureConversationAction->execute($order);

        if ($user->role === 'customer') {
            $this->ensureConversationAction->upsertParticipant($conversation, $user, 'customer');
        }

        $conversation = $conversation->load($this->conversationRelations());
        $messages = $this->conversationRepository->getMessagesForUser($conversation, $user);

        return $this->successResponse([
            'conversation' => $this->formatConversation($conversation),
            'messages' => $messages,
        ], 'Conversation started successfully.', 201);
    }

    private function userCanAccessOrderConversation(User $user, Order $order): bool
    {
        if ($user->role === 'customer') {
            return $user->customer && (int) $user->customer->id === (int) $order->customer_id;
        }

        if (in_array($user->role, ['pharmacist', 'pharmacy_admin'], true)) {
            return $user->pharmacy_id !== null && (int) $user->pharmacy_id === (int) $order->pharmacy_id;
        }

        return false;
    }

    private function formatConversation(Conversation $conversation): array
    {
        return [
            'id' => $conversation->id,
            'order_id' => $conversation->order_id,
            'pharmacy_id' => $conversation->pharmacy_id,
            'customer_user_id' => $conversation->customer_user_id,
            'assigned_pharmacist_user_id' => $conversation->assigned_pharmacist_user_id,
            'status' => $conversation->status,
            'last_message_at' => $conversation->last_message_at,
            'closed_at' => $conversation->closed_at,
            'order' => $conversation->order,
            'pharmacy' => $conversation->pharmacy,
            'customer' => $conversation->customer,
            'assigned_pharmacist' => $conversation->assignedPharmacist,
            'latest_message' => $conversation->latestMessage,
        ];
    }

    private function conversationRelations(): array
    {
        return [
            'order:id,order_number,customer_id,pharmacy_id,status,placed_at,completed_at,cancelled_at',
            'pharmacy:id,pharmacy_name,location',
            'customer:id,first_name,last_name,email,pharmacy_id',
            'assignedPharmacist:id,first_name,last_name,email,pharmacy_id',
            'latestMessage.sender:id,first_name,last_name,role',
        ];
    }
}
