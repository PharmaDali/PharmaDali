<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use App\Traits\ThrottlesLogins;

class LoginService
{
    use ThrottlesLogins;

    public function handle(array $credentials, string $ip): JsonResponse
    {
        $this->ensureIsNotRateLimited('login:' . $ip);

        if (!Auth::attempt([
            'email'    => $credentials['email'],
            'password' => $credentials['password'],
        ])) {
            RateLimiter::hit('login:' . $ip);
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        // This endpoint is customer-only; other roles should use dedicated login endpoints.
        if ($user->role !== 'customer') {
            RateLimiter::hit('login:' . $ip);
            Auth::logout();
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        RateLimiter::clear('login:' . $ip);

        $customer = $user->customer()->firstOrCreate([]);

        $user->tokens()->delete();

        $token = $user->createToken('API Token', $this->tokenAbilitiesForRole($user->role))->plainTextToken;

        return response()->json([
            'token'      => $token,
            'token_type' => 'Bearer',
            'role'       => $user->role,
            'user'       => $user->load('customer'),
            'customer_id' => $customer->id,
        ]);
    }

    private function tokenAbilitiesForRole(string $role): array
    {
        return match ($role) {
            'customer' => ['customer'],
            default    => [],
        };
    }
}