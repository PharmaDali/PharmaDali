<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository
{
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findCustomerByEmail(string $email): ?User
    {
        return User::where('email', $email)
            ->where('role', 'customer')
            ->first();
    }

    public function findPharmacistByEmail(string $email): ?User
    {
        return User::where('email', $email)
            ->whereIn('role', ['pharmacist', 'pharmacy_admin'])
            ->first();
    }
}
