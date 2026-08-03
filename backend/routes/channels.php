<?php

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversations.{conversationId}', function (User $user, int $conversationId) {
    return Conversation::query()
        ->whereKey($conversationId)
        ->where(function ($query) use ($user) {
            $query->where('customer_user_id', $user->id);

            if (in_array($user->role, ['pharmacist', 'pharmacy_admin'], true)) {
                $query->orWhere('assigned_pharmacist_user_id', $user->id)
                    ->orWhere('pharmacy_id', $user->pharmacy_id);
            }
        })
        ->exists();
});

Broadcast::channel('App.Models.User.{id}', function (User $user, int $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversations.{conversationId}.staff', function (User $user, int $conversationId) {
    return in_array($user->role, ['pharmacist', 'pharmacy_admin'], true)
        && Conversation::query()
            ->whereKey($conversationId)
            ->where('pharmacy_id', $user->pharmacy_id)
            ->exists();
});