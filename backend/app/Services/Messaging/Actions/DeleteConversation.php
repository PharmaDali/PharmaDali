<?php

namespace App\Services\Messaging\Actions;

use App\Models\Conversation;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class DeleteConversation
{
    use ApiResponseTrait;

    public function execute(User $user, Conversation $conversation): JsonResponse
    {
        if (!$this->userCanAccessConversation($user, $conversation)) {
            return $this->errorResponse('You are not allowed to delete this conversation.', 403);
        }

        if ($user->role === 'customer') {
            $conversation->forceFill([
                'deleted_by_customer_at' => now(),
            ])->save();
        } elseif (in_array($user->role, ['pharmacist', 'pharmacy_admin'], true)) {
            $conversation->forceFill([
                'deleted_by_pharmacist_at' => now(),
            ])->save();
        } else {
            return $this->errorResponse('Unauthorized role for this action.', 403);
        }

        return $this->successResponse([
            'id' => $conversation->id,
        ], 'Conversation deleted successfully.');
    }

    private function userCanAccessConversation(User $user, Conversation $conversation): bool
    {
        if ($user->role === 'customer') {
            return (int) $conversation->customer_user_id === (int) $user->id;
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

