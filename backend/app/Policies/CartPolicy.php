<?php

namespace App\Policies;

use App\Models\User;

class CartPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'customer' && !is_null($user->customer);
    }

    public function create(User $user): bool
    {
        return $user->role === 'customer' && !is_null($user->customer);
    }
}
