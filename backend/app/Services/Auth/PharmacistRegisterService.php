<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PharmacistRegisterService
{
    public function handle(array $data): JsonResponse
    {
        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'first_name'    => $data['first_name'],
                'last_name'     => $data['last_name'],
                'email'         => $data['email'],
                'password'      => Hash::make($data['password']),
                'mobile_number' => $data['mobile_number'],
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'address'       => $data['address'] ?? null,
                'role'          => 'pharmacist',
            ]);

            $user->pharmacist()->create([
                'employee_number' => $data['employee_number'],
                'license_number'  => $data['license_number'],
            ]);

            return $user;
        });

        $user->load('pharmacist');

        $token = $user->createToken('API Token', ['pharmacist'])->plainTextToken;

        return response()->json([
            'message'    => 'Pharmacist registered successfully',
            'token'      => $token,
            'token_type' => 'Bearer',
            'role'       => 'pharmacist',
            'user'       => $user,
        ], 201);
    }
}
