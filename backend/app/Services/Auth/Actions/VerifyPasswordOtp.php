<?php

namespace App\Services\Auth\Actions;

use App\Traits\ApiResponseTrait;
use App\Traits\HasCacheStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class VerifyPasswordOtp
{
    use ApiResponseTrait, HasCacheStore;

    public function execute(string $otpKey, string $tokenKey, string $otp): JsonResponse
    {
        $storedHashedOtp = $this->cacheStore()->get($otpKey);

        if (!$storedHashedOtp) {
            Log::info("VerifyPasswordOtp failed: storedHashedOtp not found for key {$otpKey}");
            return $this->errorResponse('Invalid or expired OTP code. Please request a new one.', 422);
        }

        $inputHashedOtp = hash('sha256', $otp);

        if (!hash_equals($storedHashedOtp, $inputHashedOtp)) {
            Log::info("VerifyPasswordOtp failed: OTP mismatch. Input: {$otp}, HashedInput: {$inputHashedOtp}, Stored: {$storedHashedOtp}");
            return $this->errorResponse('Incorrect OTP code. Please try again.', 422);
        }

        // Invalidate OTP in Redis so it cannot be reused
        $this->cacheStore()->forget($otpKey);

        // Generate temporary reset token
        $resetToken = Str::random(60);
        $hashedResetToken = hash('sha256', $resetToken);

        // Store reset token in Redis for 10 minutes
        $this->cacheStore()->put($tokenKey, $hashedResetToken, now()->addMinutes(10));

        return response()->json([
            'success'     => true,
            'status'      => 'success',
            'message'     => 'OTP verified successfully.',
            'reset_token' => $resetToken,
        ], 200);
    }
}
