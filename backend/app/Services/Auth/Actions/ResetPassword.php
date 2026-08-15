<?php

namespace App\Services\Auth\Actions;

use App\Models\User;
use App\Traits\ApiResponseTrait;
use App\Traits\HasCacheStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class ResetPassword
{
    use ApiResponseTrait, HasCacheStore;

    private const SUCCESS_MESSAGE = 'Your password has been reset successfully. You may now log in.';

    public function execute(User $user, string $tokenKey, string $resetToken, string $newPassword, string $successMessage = self::SUCCESS_MESSAGE): JsonResponse
    {
        $storedHashedToken = $this->cacheStore()->get($tokenKey);

        if (!$storedHashedToken) {
            return $this->errorResponse('Invalid or expired password reset session. Please start over.', 422);
        }

        $inputHashedToken = hash('sha256', $resetToken);

        if (!hash_equals($storedHashedToken, $inputHashedToken)) {
            return $this->errorResponse('Invalid reset token. Please start over.', 422);
        }

        // Update password
        $user->forceFill([
            'password' => Hash::make($newPassword),
        ])->save();

        if ($user->pharmacist) {
            $user->pharmacist->update(['requires_password_change' => false]);
        }

        // Revoke other active API tokens while preserving current session token if authenticated
        $currentTokenId = request()->user()?->currentAccessToken()?->id;
        if ($currentTokenId) {
            $user->tokens()->where('id', '!=', $currentTokenId)->delete();
        } else {
            $user->tokens()->delete();
        }

        // Remove reset token from Redis
        $this->cacheStore()->forget($tokenKey);

        return $this->successResponse(null, $successMessage, 200);
    }
}
