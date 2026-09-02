<?php

namespace App\Services\Auth\Actions;

use App\Models\User;
use App\Traits\ApiResponseTrait;
use App\Traits\HasCacheStore;
use Illuminate\Http\JsonResponse;

class SendPasswordOtp
{
    use ApiResponseTrait, HasCacheStore;

    public function execute(
        User $user,
        string $otpKey,
        string $rateLimitKey,
        callable $notificationCallback
    ): JsonResponse {
        if ($this->cacheStore()->has($rateLimitKey)) {
            return $this->errorResponse('Please wait 60 seconds before requesting another OTP.', 429);
        }

        // Generate 6-digit numeric OTP code
        $otp = (string) random_int(100000, 999999);
        $hashedOtp = hash('sha256', $otp);
        if (app()->environment('local')) {
            \Illuminate\Support\Facades\Log::info("OTP for {$user->email}: {$otp}");
        }

        // Store hashed OTP in Redis with 5-minute TTL (300 seconds)
        $this->cacheStore()->put($otpKey, $hashedOtp, now()->addMinutes(5));

        // Set rate limit for 60 seconds
        $this->cacheStore()->put($rateLimitKey, true, now()->addSeconds(60));

        // Send OTP Notification email
        $user->notify($notificationCallback($otp));

        return response()->json([
            'success'            => true,
            'status'             => 'success',
            'message'            => 'OTP has been sent to your registered email address.',
            'expires_in_seconds' => 300,
        ], 200);
    }
}


