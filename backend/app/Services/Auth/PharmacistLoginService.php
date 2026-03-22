<?php

namespace App\Services\Auth;

use App\Models\Pharmacist;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use App\Traits\ThrottlesLogins;

class PharmacistLoginService
{
    use ThrottlesLogins;

    public function handle(array $credentials, string $ip): JsonResponse
    {
        $this->ensureIsNotRateLimited('pharmacist_login:' . $ip);

        $pharmacist = Pharmacist::query()
            ->where('employee_number', $credentials['employee_number'])
            ->with('user')
            ->first();

        if (!$this->isValidPharmacist($pharmacist, $credentials['password'])) {
           RateLimiter::hit('pharmacist_login:' . $ip);
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        RateLimiter::clear('pharmacist_login:' . $ip);

        /** @var User $user */
        $user = $pharmacist->user;

        Auth::login($user);

        $user->tokens()->delete();

        $token = $user->createToken('API Token', ['pharmacist'])->plainTextToken;

        return response()->json([
            'token'      => $token,
            'token_type' => 'Bearer',
            'role'       => 'pharmacist',
            'user'       => $user->load('pharmacist'),
        ]);
    }

    private function isValidPharmacist(?Pharmacist $pharmacist, string $password): bool
    {
        if (!$pharmacist || !$pharmacist->user) {
            return false;
        }

        return Hash::check($password, $pharmacist->user->password);
    }
}