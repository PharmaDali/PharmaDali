<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CustomerRegisterService
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
                'role'          => 'customer',
            ]);

            $user->customer()->firstOrCreate([]);

            return $user;
        });

        $user->load('customer');

        $token = $user->createToken('API Token', ['customer'])->plainTextToken;

        return response()->json([
            'message'     => 'Customer registered successfully',
            'token'       => $token,
            'token_type'  => 'Bearer',
            'role'        => 'customer',
            'user'        => $user,
            'customer_id' => $user->customer?->id,
        ], 201);
    }
}
