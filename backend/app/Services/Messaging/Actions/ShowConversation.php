<?php

namespace App\Services\Messaging\Actions;

use App\Models\Conversation;
use App\Models\User;
use App\Repositories\ConversationRepository;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class ShowConversation
{
    use ApiResponseTrait;

    public function __construct(
        private readonly ConversationRepository $conversationRepository
    ) {}

    public function execute(User $user, Conversation $conversation): JsonResponse
    {
        if (!$this->userCanParticipateInConversation($user, $conversation)) {
            return $this->errorResponse('You are not allowed to access this conversation.', 403);
        }

        $conversation->load($this->conversationRelations());

        $this->conversationRepository->markIncomingMessagesAsRead($user, $conversation);

        $messages = $this->conversationRepository->getMessagesForUser($conversation, $user);

        return $this->successResponse([
            'conversation' => $this->formatConversation($conversation),
            'messages' => $messages,
        ]);
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
        // Closure-based eager loads are required here.
        // The shorthand "relation:col,col" string syntax builds a fresh
        // query that does NOT inherit withoutGlobalScopes() from the
        // BelongsTo definition, so Orders are always filtered to null
        // when a pharmacy global scope is active (e.g. customer requests).
        return [
            'order' => fn ($q) => $q->withoutGlobalScopes()->select([
                'id', 'order_number', 'customer_id', 'pharmacy_id', 'status',
                'payment_method', 'payment_status', 'subtotal', 'total_amount',
                'placed_at', 'completed_at', 'cancelled_at',
            ]),
            'order.items' => fn ($q) => $q->select([
                'id', 'order_id', 'pharmacy_product_id',
                'quantity', 'unit_price_snapshot', 'line_total', 'product_name',
            ]),
            'order.items.orderItemPrescription',
            'order.items.pharmacyProduct' => fn ($q) => $q->withoutGlobalScopes()
                ->select(['id', 'product_id', 'category_id']),
            'order.items.pharmacyProduct.product' => fn ($q) => $q->withoutGlobalScopes()
                ->select([
                    'id', 'product_name', 'generic_name', 'brand_name',
                    'strength', 'form', 'size', 'is_prescribed', 'image_path',
                ]),
            'order.items.pharmacyProduct.category' => fn ($q) => $q->select(['id', 'category_name']),
            'pharmacy:id,pharmacy_name,location',
            'customer:id,first_name,last_name,email,pharmacy_id',
            'assignedPharmacist:id,first_name,last_name,email,pharmacy_id',
            'latestMessage.sender:id,first_name,last_name,role',
        ];
    }

}
