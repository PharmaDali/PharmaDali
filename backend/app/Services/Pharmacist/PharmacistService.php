<?php

namespace App\Services\Pharmacist;

use App\Models\Pharmacist;
use App\Models\User;

class PharmacistService
{
    /**
     * Fetch all pharmacists belonging to the admin's pharmacy.
     */
    public function getPharmacists(User $admin)
    {
        return User::where('pharmacy_id', $admin->pharmacy_id)
            ->where('role', 'pharmacist')
            ->with('pharmacist')
            ->get();
    }

    /**
     * Update details of a specific pharmacist user.
     */
    public function updatePharmacist(User $admin, int $pharmacistId, array $data): User
    {
        $user = User::where('id', $pharmacistId)
            ->where('pharmacy_id', $admin->pharmacy_id)
            ->where('role', 'pharmacist')
            ->firstOrFail();

        $user->fill(array_filter([
            'first_name'    => $data['first_name'] ?? null,
            'last_name'     => $data['last_name'] ?? null,
            'email'         => $data['email'] ?? null,
            'mobile_number' => $data['mobile_number'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'address'       => $data['address'] ?? null,
            'is_active'     => $data['is_active'] ?? null,
        ], fn ($value) => !is_null($value)));

        $user->save();

        if (array_key_exists('license_number', $data)) {
            $user->pharmacist()->updateOrCreate(
                ['user_id' => $user->id],
                ['license_number' => $data['license_number']]
            );
        }

        return $user->load('pharmacist');
    }

    /**
     * Update permissions for a specific pharmacist user.
     */
    public function updatePermissions(User $admin, int $pharmacistId, array $permissions): User
    {
        $user = User::where('id', $pharmacistId)
            ->where('pharmacy_id', $admin->pharmacy_id)
            ->where('role', 'pharmacist')
            ->firstOrFail();

        $pharmacistProfile = $user->pharmacist;
        if (!$pharmacistProfile) {
            $pharmacistProfile = Pharmacist::create([
                'user_id' => $user->id,
                'employee_number' => 'EMP-' . str_pad((string) $user->id, 4, '0', STR_PAD_LEFT),
            ]);
        }

        $pharmacistProfile->permissions = array_values($permissions);
        $pharmacistProfile->save();

        return $user->load('pharmacist');
    }

    /**
     * Delete a pharmacist user.
     */
    public function deletePharmacist(User $admin, int $pharmacistId): bool
    {
        $user = User::where('id', $pharmacistId)
            ->where('pharmacy_id', $admin->pharmacy_id)
            ->where('role', 'pharmacist')
            ->firstOrFail();

        return (bool) $user->delete();
    }
}
