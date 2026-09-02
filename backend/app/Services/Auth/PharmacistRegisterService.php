<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Notifications\PharmacistWelcomeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PharmacistRegisterService
{
    public function handle(array $data, ?User $createdBy): JsonResponse
    {
        if (!$createdBy) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $pharmacyId = $createdBy->hasRole('super_admin') 
            ? ($data['pharmacy_id'] ?? null) 
            : $createdBy->pharmacy_id;

        if (is_null($pharmacyId)) {
            return response()->json([
                'message' => 'Pharmacy admin must be assigned to a pharmacy before registering pharmacists, or pharmacy_id must be provided.',
            ], 422);
        }

        $temporaryPassword = Str::password(12);

        $user = DB::transaction(function () use ($data, $temporaryPassword, $pharmacyId) {
            $user = User::create([
                'first_name'    => $data['first_name'],
                'last_name'     => $data['last_name'],
                'email'         => $data['email'],
                'password'      => Hash::make($temporaryPassword),
                'mobile_number' => $data['mobile_number'],
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'address'       => $data['address'] ?? null,
                'role'          => 'pharmacist',
                'pharmacy_id'   => $pharmacyId,
                'is_active'     => $data['is_active'] ?? true,
            ]);

            $employeeNumber = 'PHAR-' . $user->id . '-' . $pharmacyId;

            $user->pharmacist()->create([
                'employee_number'          => $employeeNumber,
                'license_number'           => $data['license_number'] ?? null,
                'requires_password_change' => 1,
            ]);

            return $user;
        });

        $user->refresh()->load(['pharmacist', 'pharmacy']);

        $user->notify(new PharmacistWelcomeNotification(
            employeeNumber: $user->pharmacist->employee_number,
            temporaryPassword: $temporaryPassword,
        ));

        return response()->json([
            'message' => 'Pharmacist registered successfully. Login credentials have been sent to their email.',
            'user'    => $user,
        ], 201);
    }
}
