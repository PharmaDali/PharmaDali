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
        $this->ensureIsNotRateLimited($ip);

        if (!Auth::attempt([
            'email'    => $credentials['email'],
            'password' => $credentials['password'],
        ])) {
            RateLimiter::hit($ip);
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        // Prevent pharmacists from using the customer login
        if ($user->role === 'pharmacist') {
            RateLimiter::hit($ip);
            Auth::logout();
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        RateLimiter::clear($ip);

        $user->tokens()->delete();

        $token = $user->createToken('API Token', $this->tokenAbilitiesForRole($user->role))->plainTextToken;

        return response()->json([
            'token'      => $token,
            'token_type' => 'Bearer',
            'role'       => $user->role,
            'user'       => $user,
        ]);
    }

    private function tokenAbilitiesForRole(string $role): array
    {
        return match ($role) {
            'customer' => ['customer'],
            'admin'    => [],
            default    => [],
        };
    }
}