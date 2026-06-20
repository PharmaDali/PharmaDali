<?php

namespace App\Policies;

use App\Models\User;

class PharmacistPolicy
{
    public function create(User $user): bool
    {
        return $user->role === 'pharmacy_admin' && !is_null($user->pharmacy_id);
    }
}