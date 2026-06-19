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

        if (is_null($createdBy->pharmacy_id)) {
            return response()->json([
                'message' => 'Pharmacy admin must be assigned to a pharmacy before registering pharmacists.',
            ], 422);
        }

        $temporaryPassword = Str::password(12);

        $user = DB::transaction(function () use ($data, $createdBy, $temporaryPassword) {
            $user = User::create([
                'first_name'    => $data['first_name'],
                'last_name'     => $data['last_name'],
                'email'         => $data['email'],
                'password'      => Hash::make($temporaryPassword),
                'mobile_number' => $data['mobile_number'],
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'address'       => $data['address'] ?? null,
                'role'          => 'pharmacist',
                'pharmacy_id'     => $createdBy->pharmacy_id,
            ]);

            $employeeNumber = 'PHAR-' . $user->id . '-' . $createdBy->pharmacy_id;

            $user->pharmacist()->create([
                'employee_number' => $employeeNumber,
                'license_number'  => $data['license_number'] ?? null,
            ]);

            return $user;
        });

        $user->load(['pharmacist', 'pharmacy']);

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
