<?php

namespace App\Services\Messaging;

use App\Events\ConversationMessageCreated;
use App\Models\ConversationAssignment;
use App\Models\ConversationMessage;
use App\Models\ConversationParticipant;
use App\Models\Conversation;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ConversationService
{
    public function listConversations(User $user): JsonResponse
    {
        $conversations = Conversation::query()
            ->forUser($user)
            ->with([
                'order:id,order_number,customer_id,branch_id,status,placed_at,completed_at,cancelled_at',
                'pharmacy:id,branch_name,location',
                'customer:id,first_name,last_name,email,branch_id',
                'assignedPharmacist:id,first_name,last_name,email,branch_id',
                'latestMessage.sender:id,first_name,last_name,role',
            ])
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $conversations,
        ]);
    }

    public function listContacts(User $user): JsonResponse
    {
        return $this->listConversations($user);
    }

    public function startConversation(User $user, int $orderId): JsonResponse
    {
        $order = Order::query()->with(['customer.user', 'branch'])->find($orderId);

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found.',
            ], 404);
        }

        if (!$this->userCanAccessOrderConversation($user, $order)) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not allowed to open this conversation.',
            ], 403);
        }

        $conversation = $this->ensureConversationForOrder($order);

        if ($user->role === 'customer') {
            $this->upsertParticipant($conversation, $user, 'customer');
        }

        $conversation = $conversation->load($this->conversationRelations());

        return response()->json([
            'status' => 'success',
            'data' => [
                'conversation' => $this->formatConversation($conversation),
                'messages' => $conversation->messages()
                    ->visibleTo($user)
                    ->with('sender:id,first_name,last_name,role')
                    ->orderBy('id')
                    ->paginate(50),
            ],
        ], 201);
    }

    public function appendSystemMessage(Order $order, string $body, array $metadata = []): ConversationMessage
    {
        $conversation = $this->ensureConversationForOrder($order);

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

        event(new ConversationMessageCreated($message));

        return $message;
    }

    public function showConversation(User $user, Conversation $conversation): JsonResponse
    {
        if (!$this->userCanParticipateInConversation($user, $conversation)) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not allowed to access this conversation.',
            ], 403);
        }

        $conversation->load($this->conversationRelations());

        $this->markIncomingMessagesAsRead($user, $conversation);

        $messages = $this->visibleMessages($conversation, $user)
            ->orderBy('id')
            ->paginate(50);

        return response()->json([
            'status' => 'success',
            'data' => [
                'conversation' => $this->formatConversation($conversation),
                'messages' => $messages,
            ],
        ]);
    }

    public function sendMessage(User $user, Conversation $conversation, string $body): JsonResponse
    {
        if (!$this->userCanParticipateInConversation($user, $conversation)) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not allowed to send messages in this conversation.',
            ], 403);
        }

        $body = trim($body);

        if ($body === '') {
            return response()->json([
                'status' => 'error',
                'message' => 'Message body is required.',
            ], 422);
        }

        $message = DB::transaction(function () use ($conversation, $user, $body) {
            if (in_array($user->role, ['pharmacist', 'branch_admin'], true)) {
                $this->claimConversationForPharmacist($conversation, $user);
            }

            $message = $conversation->messages()->create([
                'sender_user_id' => $user->id,
                'message_type' => 'user',
                'visibility' => 'public',
                'body' => $body,
            ]);

            $conversation->forceFill([
                'last_message_at' => $message->created_at,
            ])->save();

            $this->upsertParticipant($conversation, $user, $user->role);

            return $message;
        });

        event(new ConversationMessageCreated($message));

        return response()->json([
            'status' => 'success',
            'message' => 'Message sent successfully.',
            'data' => $message->load('sender:id,first_name,last_name,role'),
        ], 201);
    }

    public function ensureConversationForOrder(Order $order): Conversation
    {
        return DB::transaction(function () use ($order) {
            $conversation = Conversation::query()->firstOrCreate(
                ['order_id' => $order->id],
                [
                    'pharmacy_id' => $order->branch_id,
                    'customer_user_id' => $order->customer?->user_id,
                    'status' => 'open',
                ]
            );

            $conversation->forceFill([
                'pharmacy_id' => $conversation->pharmacy_id ?? $order->branch_id,
                'customer_user_id' => $conversation->customer_user_id ?? $order->customer?->user_id,
            ])->save();

            if ($order->customer?->user_id) {
                $this->upsertParticipant($conversation, $order->customer->user, 'customer');
            }

            return $conversation;
        });
    }

    private function userCanParticipateInConversation(User $user, Conversation $conversation): bool
    {
        if ((int) $conversation->customer_user_id === (int) $user->id) {
            return $user->role === 'customer';
        }

        if (in_array($user->role, ['pharmacist', 'branch_admin'], true)) {
            if ($conversation->assigned_pharmacist_user_id && (int) $conversation->assigned_pharmacist_user_id === (int) $user->id) {
                return true;
            }

            return $user->branch_id !== null && (int) $user->branch_id === (int) $conversation->pharmacy_id;
        }

        return false;
    }

    private function markIncomingMessagesAsRead(User $user, Conversation $conversation): void
    {
        $conversation->messages()
            ->visibleTo($user)
            ->where('sender_user_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
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
            'order:id,order_number,customer_id,branch_id,status,placed_at,completed_at,cancelled_at',
            'pharmacy:id,branch_name,location',
            'customer:id,first_name,last_name,email,branch_id',
            'assignedPharmacist:id,first_name,last_name,email,branch_id',
            'latestMessage.sender:id,first_name,last_name,role',
        ];
    }

    private function visibleMessages(Conversation $conversation, User $user)
    {
        return $conversation->messages()
            ->visibleTo($user)
            ->with('sender:id,first_name,last_name,role')
            ->orderBy('id');
    }

    private function userCanAccessOrderConversation(User $user, Order $order): bool
    {
        if ($user->role === 'customer') {
            return $user->customer && (int) $user->customer->id === (int) $order->customer_id;
        }

        if (in_array($user->role, ['pharmacist', 'branch_admin'], true)) {
            return $user->branch_id !== null && (int) $user->branch_id === (int) $order->branch_id;
        }

        return false;
    }

    private function claimConversationForPharmacist(Conversation $conversation, User $user): void
    {
        if (!in_array($user->role, ['pharmacist', 'branch_admin'], true)) {
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

    private function upsertParticipant(Conversation $conversation, User $user, string $role): void
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
}