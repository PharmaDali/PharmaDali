<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Notifications\AdminLoginNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;

class AdminLoginService
{
    public function handle(array $credentials, string $ip, string $device): JsonResponse
    {
        $this->ensureIsNotRateLimited($ip);

        if (!Auth::attempt([
            'email'    => $credentials['email'],
            'password' => $credentials['password'],
        ])) {
            RateLimiter::hit('admin-login:' . $ip);
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        // Block non-admin roles from using this endpoint
        if (!in_array($user->role, ['branch_admin', 'super_admin'])) {
            Auth::logout();
            RateLimiter::hit('admin-login:' . $ip);
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Block inactive accounts
        if (!$user->is_active) {
            Auth::logout();
            return response()->json(['message' => 'Your account has been deactivated.'], 403);
        }

        RateLimiter::clear('admin-login:' . $ip);

        $user->tokens()->delete();

        $token = $user->createToken(
            'API Token',
            [$user->role],
            now()->addHours(8) // admin tokens expire after 8 hours
        )->plainTextToken;

        // Notify admin of new login
        $user->notify(new AdminLoginNotification(
            ip: $ip,
            time: now()->toDateTimeString(),
            device: $device
        ));

        return response()->json([
            'token'      => $token,
            'token_type' => 'Bearer',
            'role'       => $user->role,
            'user'       => $user->load('branch'),
        ]);
    }

    private function ensureIsNotRateLimited(string $ip): void
    {
        if (RateLimiter::tooManyAttempts('admin-login:' . $ip, 3)) {
            $seconds = RateLimiter::availableIn('admin-login:' . $ip);
            abort(429, "Too many attempts. Try again in {$seconds} seconds.");
        }
    }
}