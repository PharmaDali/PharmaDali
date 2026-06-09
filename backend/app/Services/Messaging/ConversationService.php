<?php

namespace App\Services\Messaging;

use App\Events\ConversationMessageCreated;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ConversationService
{
    public function listConversations(User $user): JsonResponse
    {
        $conversations = Conversation::query()
            ->forUser($user)
            ->with([
                'branch',
                'customer:id,first_name,last_name,email,branch_id',
                'pharmacist:id,first_name,last_name,email,branch_id',
                'latestMessage.sender:id,first_name,last_name',
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
        $contacts = $user->role === 'customer'
            ? $this->listCustomerContacts($user)
            : $this->listPharmacistContacts($user);

        if ($contacts instanceof JsonResponse) {
            return $contacts;
        }

        return response()->json([
            'status' => 'success',
            'data' => $contacts,
        ]);
    }

    public function startConversation(User $user, int $counterpartUserId): JsonResponse
    {
        $conversationOrError = $this->resolveOrCreateConversation($user, $counterpartUserId);

        if ($conversationOrError instanceof JsonResponse) {
            return $conversationOrError;
        }

        return response()->json([
            'status' => 'success',
            'data' => $this->formatConversation($conversationOrError->load([
                'branch',
                'customer:id,first_name,last_name,email,branch_id',
                'pharmacist:id,first_name,last_name,email,branch_id',
                'latestMessage.sender:id,first_name,last_name',
            ])),
        ], 201);
    }

    public function showConversation(User $user, Conversation $conversation): JsonResponse
    {
        $accessError = $this->assertConversationAccess($user, $conversation);

        if ($accessError instanceof JsonResponse) {
            return $accessError;
        }

        $conversation->load([
            'branch',
            'customer:id,first_name,last_name,email,branch_id',
            'pharmacist:id,first_name,last_name,email,branch_id',
            'latestMessage.sender:id,first_name,last_name',
        ]);

        $this->markIncomingMessagesAsRead($user, $conversation);

        $messages = $conversation->messages()
            ->with('sender:id,first_name,last_name')
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
        $accessError = $this->assertConversationAccess($user, $conversation);

        if ($accessError instanceof JsonResponse) {
            return $accessError;
        }

        if (!$this->userCanParticipateInConversation($user, $conversation)) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not allowed to send messages in this conversation.',
            ], 403);
        }

        $message = DB::transaction(function () use ($conversation, $user, $body) {
            $message = $conversation->messages()->create([
                'sender_user_id' => $user->id,
                'body' => $body,
            ]);

            $conversation->forceFill([
                'last_message_at' => $message->created_at,
            ])->save();

            return $message;
        });

        event(new ConversationMessageCreated($message));

        return response()->json([
            'status' => 'success',
            'message' => 'Message sent successfully.',
            'data' => $message->load('sender:id,first_name,last_name'),
        ], 201);
    }

    private function listCustomerContacts(User $user): JsonResponse|Collection
    {
        $customer = $user->customer;

        if (!$customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer profile not found.',
            ], 403);
        }

        if (!$customer->branch_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Select a pharmacy branch before starting a conversation.',
            ], 422);
        }

        return User::query()
            ->where('role', 'pharmacist')
            ->where('branch_id', $customer->branch_id)
            ->with('pharmacist')
            ->orderBy('first_name')
            ->get();
    }

    private function listPharmacistContacts(User $user): JsonResponse|Collection
    {
        if (!$user->branch_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pharmacist must belong to a branch to view customers.',
            ], 422);
        }

        return User::query()
            ->where('role', 'customer')
            ->whereHas('customer', function ($query) use ($user) {
                $query->where('branch_id', $user->branch_id);
            })
            ->with('customer')
            ->orderBy('first_name')
            ->get();
    }

    private function resolveOrCreateConversation(User $user, int $counterpartUserId): Conversation|JsonResponse
    {
        $counterpart = User::query()->with(['customer', 'pharmacist'])->find($counterpartUserId);

        if (!$counterpart) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation participant not found.',
            ], 404);
        }

        if ($user->role === 'customer') {
            return $this->resolveCustomerConversation($user, $counterpart);
        }

        if ($user->role === 'pharmacist') {
            return $this->resolvePharmacistConversation($user, $counterpart);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Only customers and pharmacists can use messaging.',
        ], 403);
    }

    private function resolveCustomerConversation(User $customerUser, User $pharmacistUser): Conversation|JsonResponse
    {
        if (!$customerUser->customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'Customer profile not found.',
            ], 403);
        }

        if ($pharmacistUser->role !== 'pharmacist' || !$pharmacistUser->branch_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'You can only start a conversation with a pharmacist.',
            ], 422);
        }

        if ($customerUser->customer->branch_id && (int) $customerUser->customer->branch_id !== (int) $pharmacistUser->branch_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'You can only message pharmacists from your assigned branch.',
            ], 403);
        }

        if (!$customerUser->customer->branch_id) {
            $customerUser->customer()->update([
                'branch_id' => $pharmacistUser->branch_id,
            ]);
            $customerUser->load('customer');
        }

        return Conversation::query()->firstOrCreate([
            'customer_user_id' => $customerUser->id,
            'pharmacist_user_id' => $pharmacistUser->id,
        ], [
            'branch_id' => $pharmacistUser->branch_id,
        ]);
    }

    private function resolvePharmacistConversation(User $pharmacistUser, User $customerUser): Conversation|JsonResponse
    {
        if (!$pharmacistUser->branch_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pharmacist must belong to a branch to start a conversation.',
            ], 422);
        }

        if ($customerUser->role !== 'customer' || !$customerUser->customer) {
            return response()->json([
                'status' => 'error',
                'message' => 'You can only start a conversation with a customer.',
            ], 422);
        }

        if (!$customerUser->customer->branch_id || (int) $customerUser->customer->branch_id !== (int) $pharmacistUser->branch_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'This customer does not belong to your branch.',
            ], 403);
        }

        return Conversation::query()->firstOrCreate([
            'customer_user_id' => $customerUser->id,
            'pharmacist_user_id' => $pharmacistUser->id,
        ], [
            'branch_id' => $pharmacistUser->branch_id,
        ]);
    }

    private function assertConversationAccess(User $user, Conversation $conversation): JsonResponse|bool
    {
        if (!$this->userCanParticipateInConversation($user, $conversation)) {
            return response()->json([
                'status' => 'error',
                'message' => 'You are not allowed to access this conversation.',
            ], 403);
        }

        return true;
    }

    private function userCanParticipateInConversation(User $user, Conversation $conversation): bool
    {
        if ($conversation->customer_user_id === $user->id) {
            return $user->role === 'customer';
        }

        if ($conversation->pharmacist_user_id === $user->id) {
            return $user->role === 'pharmacist' && (int) $user->branch_id === (int) $conversation->branch_id;
        }

        return false;
    }

    private function markIncomingMessagesAsRead(User $user, Conversation $conversation): void
    {
        $conversation->messages()
            ->where('sender_user_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    private function formatConversation(Conversation $conversation): array
    {
        return [
            'id' => $conversation->id,
            'branch_id' => $conversation->branch_id,
            'customer_user_id' => $conversation->customer_user_id,
            'pharmacist_user_id' => $conversation->pharmacist_user_id,
            'last_message_at' => $conversation->last_message_at,
            'branch' => $conversation->branch,
            'customer' => $conversation->customer,
            'pharmacist' => $conversation->pharmacist,
            'latest_message' => $conversation->latestMessage,
        ];
    }
}