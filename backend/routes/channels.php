<?php

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversations.{conversationId}', function (User $user, int $conversationId) {
    return Conversation::query()
        ->whereKey($conversationId)
        ->where(function ($query) use ($user) {
            $query->where('customer_user_id', $user->id)
                ->orWhere('pharmacist_user_id', $user->id);
        })
        ->exists();
});