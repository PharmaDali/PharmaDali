<?php

namespace App\Repositories;

use App\Models\Conversation;
use App\Models\ConversationAssignment;
use App\Models\ConversationMessage;
use App\Models\ConversationParticipant;
use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class ConversationRepository
{
    public function getConversationsForUser(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return Conversation::query()
            ->forUser($user)
            ->with([
                'order:id,order_number,customer_id,pharmacy_id,status,placed_at,completed_at,cancelled_at',
                'pharmacy:id,pharmacy_name,location',
                'customer:id,first_name,last_name,email,pharmacy_id',
                'assignedPharmacist:id,first_name,last_name,email,pharmacy_id',
                'latestMessage.sender:id,first_name,last_name,role',
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function findOrderById(int $orderId): ?Order
    {
        return Order::query()
            ->withoutGlobalScopes()
            ->with(['customer.user', 'pharmacy'])
            ->find($orderId);
    }

    public function ensureConversationForOrder(Order $order): Conversation
    {
        return DB::transaction(function () use ($order) {
            $conversation = Conversation::query()->firstOrCreate(
                ['order_id' => $order->id],
                [
                    'pharmacy_id' => $order->pharmacy_id,
                    'customer_user_id' => $order->customer?->user_id,
                    'status' => 'open',
                ]
            );

            $conversation->forceFill([
                'pharmacy_id' => $conversation->pharmacy_id ?? $order->pharmacy_id,
                'customer_user_id' => $conversation->customer_user_id ?? $order->customer?->user_id,
            ])->save();

            if ($order->customer?->user_id) {
                $this->upsertParticipant($conversation, $order->customer->user, 'customer');
            }

            return $conversation;
        });
    }

    public function upsertParticipant(Conversation $conversation, User $user, string $role): void
    {
        ConversationParticipant::query()->updateOrCreate(
            [
                'conversation_id' => $conversation->id,
                'user_id' => $user->id,
            ],
            [
                'participant_role' => $role,
                'joined_at' => now(),
                'left_at' => null,
                'is_active' => true,
            ]
        );
    }

    public function getMessagesForUser(Conversation $conversation, User $user, int $perPage = 50): LengthAwarePaginator
    {
        return $conversation->messages()
            ->visibleTo($user)
            ->with('sender:id,first_name,last_name,role')
            ->orderBy('id')
            ->paginate($perPage);
    }

    public function markIncomingMessagesAsRead(User $user, Conversation $conversation): void
    {
        $conversation->messages()
            ->visibleTo($user)
            ->where('sender_user_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function createMessage(Conversation $conversation, User $user, ?string $body, ?array $metadata = null, string $type = 'user'): ConversationMessage
    {
        return DB::transaction(function () use ($conversation, $user, $body, $metadata, $type) {
            if (in_array($user->role, ['pharmacist', 'pharmacy_admin'], true)) {
                $this->claimConversationForPharmacist($conversation, $user);
            }

            $message = $conversation->messages()->create([
                'sender_user_id' => $user->id,
                'message_type' => $type,
                'visibility' => 'public',
                'body' => $body !== '' ? $body : null,
                'metadata' => $metadata,
            ]);

            $conversation->forceFill([
                'last_message_at' => $message->created_at,
            ])->save();

            $this->upsertParticipant($conversation, $user, $user->role);

            return $message;
        });
    }

    public function createSystemMessage(Conversation $conversation, string $body, array $metadata = []): ConversationMessage
    {
        $message = $conversation->messages()->create([
            'sender_user_id' => null,
            'message_type' => 'system',
            'visibility' => 'public',
            'body' => $body,
            'metadata' => $metadata,
        ]);

        $conversation->forceFill([
            'last_message_at' => $message->created_at,
        ])->save();

        return $message;
    }

    public function claimConversationForPharmacist(Conversation $conversation, User $user): void
    {
        if (!in_array($user->role, ['pharmacist', 'pharmacy_admin'], true)) {
            return;
        }

        if ($conversation->assigned_pharmacist_user_id && (int) $conversation->assigned_pharmacist_user_id !== (int) $user->id) {
            $currentAssignment = ConversationAssignment::query()
                ->where('conversation_id', $conversation->id)
                ->where('is_current', true)
                ->first();

            if ($currentAssignment) {
                $currentAssignment->update([
                    'is_current' => false,
                    'released_at' => now(),
                ]);
            }
        }

        if ((int) $conversation->assigned_pharmacist_user_id !== (int) $user->id) {
            $conversation->forceFill([
                'assigned_pharmacist_user_id' => $user->id,
            ])->save();

            ConversationAssignment::query()->create([
                'conversation_id' => $conversation->id,
                'pharmacist_user_id' => $user->id,
                'assigned_by_user_id' => $user->id,
                'assigned_at' => now(),
                'is_current' => true,
            ]);
        }

        $this->upsertParticipant($conversation, $user, $user->role);
    }

    public function getPharmacyPharmacistsWithTokens(?int $pharmacyId): Collection
    {
        $query = User::query()
            ->whereIn('role', ['pharmacist', 'pharmacy_admin'])
            ->whereNotNull('fcm_token');

        if ($pharmacyId) {
            $query->where('pharmacy_id', $pharmacyId);
        }

        return $query->get();
    }

    public function getCustomerUserWithToken(int $userId): ?User
    {
        return User::query()
            ->where('id', $userId)
            ->whereNotNull('fcm_token')
            ->first();
    }
}
