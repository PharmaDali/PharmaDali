<?php

namespace App\Policies;

use App\Models\User;

class PharmacistPolicy
{
    public function create(User $user): bool
    {
        return $user->role === 'branch_admin' && !is_null($user->branch_id);
    }
}