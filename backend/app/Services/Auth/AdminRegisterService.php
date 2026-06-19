<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminRegisterService
{
    public function handle(array $data): JsonResponse
    {
        $role = $data['role'];

        $user = DB::transaction(function () use ($data, $role) {
            return User::create([
                'first_name'    => $data['first_name'],
                'last_name'     => $data['last_name'],
                'email'         => $data['email'],
                'password'      => Hash::make($data['password']),
                'mobile_number' => $data['mobile_number'],
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'address'       => $data['address'] ?? null,
                'role'          => $role,
                'pharmacy_id'     => $data['pharmacy_id'] ?? null,
                'is_active'     => $data['is_active'] ?? true,
            ]);
        });

        $user->load('pharmacy');

        $token = $user->createToken('API Token', [$role], now()->addHours(8))->plainTextToken;

        return response()->json([
            'message'    => 'Admin registered successfully',
            'token'      => $token,
            'token_type' => 'Bearer',
            'role'       => $role,
            'user'       => $user,
        ], 201);
    }
}
