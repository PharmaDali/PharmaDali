<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Notifications\CustomerForgotPasswordOtpNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ForgotPasswordService
{
    /**
     * Get the cache store instance (defaults to redis if available).
     */
    private function cacheStore()
    {
        if (app()->environment('testing')) {
            return Cache::store();
        }

        try {
            return Cache::store('redis');
        } catch (\Throwable $e) {
            return Cache::store();
        }
    }

    public function sendOtp(string $email): JsonResponse
    {
        $user = User::where('email', $email)->first();

        if (!$user || $user->role !== 'customer') {
            return response()->json([
                'message' => 'No customer account found with this email address.',
            ], 404);
        }

        $rateLimitKey = "otp:customer:rate_limit:{$email}";
        if ($this->cacheStore()->has($rateLimitKey)) {
            return response()->json([
                'message' => 'Please wait 60 seconds before requesting another OTP.',
            ], 429);
        }

        // Generate 6-digit numeric OTP code
        $otp = (string) random_int(100000, 999999);
        $hashedOtp = hash('sha256', $otp);

        // Store hashed OTP in Redis with 5-minute TTL (300 seconds)
        $otpKey = "otp:customer:forgot_password:{$email}";
        $this->cacheStore()->put($otpKey, $hashedOtp, now()->addMinutes(5));

        // Set rate limit for 60 seconds
        $this->cacheStore()->put($rateLimitKey, true, now()->addSeconds(60));

        // Send OTP Notification email
        $user->notify(new CustomerForgotPasswordOtpNotification($otp));

        return response()->json([
            'message' => 'OTP has been sent to your registered email address.',
            'expires_in_seconds' => 300,
        ], 200);
    }

    public function verifyOtp(string $email, string $otp): JsonResponse
    {
        $otpKey = "otp:customer:forgot_password:{$email}";
        $storedHashedOtp = $this->cacheStore()->get($otpKey);

        if (!$storedHashedOtp) {
            return response()->json([
                'message' => 'Invalid or expired OTP code. Please request a new one.',
            ], 422);
        }

        $inputHashedOtp = hash('sha256', $otp);

        if (!hash_equals($storedHashedOtp, $inputHashedOtp)) {
            return response()->json([
                'message' => 'Incorrect OTP code. Please try again.',
            ], 422);
        }

        // Invalidate OTP in Redis so it cannot be reused
        $this->cacheStore()->forget($otpKey);

        // Generate temporary reset token
        $resetToken = Str::random(60);
        $hashedResetToken = hash('sha256', $resetToken);
        $tokenKey = "password_reset_token:{$email}";

        // Store reset token in Redis for 10 minutes
        $this->cacheStore()->put($tokenKey, $hashedResetToken, now()->addMinutes(10));

        return response()->json([
            'message'     => 'OTP verified successfully.',
            'reset_token' => $resetToken,
        ], 200);
    }

    public function resetPassword(string $email, string $resetToken, string $newPassword): JsonResponse
    {
        $tokenKey = "password_reset_token:{$email}";
        $storedHashedToken = $this->cacheStore()->get($tokenKey);

        if (!$storedHashedToken) {
            return response()->json([
                'message' => 'Invalid or expired password reset session. Please start over.',
            ], 422);
        }

        $inputHashedToken = hash('sha256', $resetToken);

        if (!hash_equals($storedHashedToken, $inputHashedToken)) {
            return response()->json([
                'message' => 'Invalid reset token. Please start over.',
            ], 422);
        }

        $user = User::where('email', $email)->first();

        if (!$user || $user->role !== 'customer') {
            return response()->json([
                'message' => 'Customer account not found.',
            ], 404);
        }

        // Update password
        $user->forceFill([
            'password' => Hash::make($newPassword),
        ])->save();

        // Revoke active API tokens
        $user->tokens()->delete();

        // Remove reset token from Redis
        $this->cacheStore()->forget($tokenKey);

        return response()->json([
            'message' => 'Your password has been reset successfully. You may now log in.',
        ], 200);
    }
}
