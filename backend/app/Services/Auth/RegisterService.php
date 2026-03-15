<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class RegisterService
{
    public function handle(array $data): JsonResponse
    {
        $role = $data['role'] ?? 'customer';

        $user = User::create([
            'first_name'    => $data['first_name'],
            'last_name'     => $data['last_name'],
            'email'         => $data['email'],
            'password'      => Hash::make($data['password']),
            'mobile_number' => $data['mobile_number'],
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'address'       => $data['address'] ?? null,
            'role'          => $role,
        ]);

        if ($role === 'pharmacist') {
            $user->pharmacist()->create([
                'employee_number' => $data['employee_number'],
                'license_number'  => $data['license_number'],
            ]);
        }

        $token = $user->createToken('API Token', $this->tokenAbilitiesForRole($role))->plainTextToken;

        return response()->json([
            'message'    => 'User registered successfully',
            'token'      => $token,
            'token_type' => 'Bearer',
            'role'       => $role,
            'user'       => $user->load('pharmacist'),
        ], 201);
    }

    private function tokenAbilitiesForRole(string $role): array
    {
        return match ($role) {
            'pharmacist' => ['pharmacist'],
            'customer'   => ['customer'],
            default      => [],
        };
    }
}