<?php

namespace App\Policies;

use App\Models\Pharmacist;
use App\Models\User;

class PharmacistPolicy
{
    public function create(User $user): bool
    {
        return in_array($user->role, ['pharmacy_admin', 'admin', 'super_admin', 'system_admin'], true) && !is_null($user->pharmacy_id);
    }

    public function managePermissions(User $user, ?Pharmacist $pharmacist = null): bool
    {
        return in_array($user->role, ['pharmacy_admin', 'admin', 'super_admin', 'system_admin'], true);
    }
}