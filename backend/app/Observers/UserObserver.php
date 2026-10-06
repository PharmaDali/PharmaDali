<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "saved" event.
     * When a user is deactivated (is_active becomes false), immediately revoke
     * all of their active Sanctum access tokens and clear their push notification token.
     */
    public function saved(User $user): void
    {
        if ($user->wasChanged('is_active') && !$user->is_active) {
            $user->tokens()->delete();
            $user->updateQuietly(['fcm_token' => null]);
        }
    }
}
