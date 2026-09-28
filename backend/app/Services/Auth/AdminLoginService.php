<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Notifications\AdminTwoFactorOtpNotification;
use App\Traits\HasCacheStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AdminLoginService
{
    use HasCacheStore;

    /**
     * Handle initial admin / pharmacist login credentials.
     * Authenticates password, then initiates a 2FA challenge.
     */
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

        // Allow pharmacy_admin, pharmacist, super_admin roles to log into administrative portals
        if (!in_array($user->role, ['pharmacy_admin', 'pharmacist', 'super_admin'], true)) {
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

        // Logout session to prevent unauthenticated access until 2FA is verified
        Auth::logout();

        // Generate 2FA challenge token & numeric 6-digit OTP
        $twoFactorToken = Str::random(64);
        $otp = (string) random_int(100000, 999999);
        $hashedOtp = hash('sha256', $otp);

        if (app()->environment('local')) {
            Log::info("Admin 2FA OTP for {$user->email}: {$otp}");
        }

        $sessionKey = "two_factor:session:{$twoFactorToken}";
        $otpKey = "two_factor:otp:{$twoFactorToken}";
        $cooldownKey = "two_factor:cooldown:{$twoFactorToken}";

        // Store session with 5-minute TTL
        $this->cacheStore()->put($sessionKey, [
            'user_id'  => $user->id,
            'ip'       => $ip,
            'attempts' => 0,
        ], now()->addMinutes(5));

        // Store hashed OTP with 5-minute TTL
        $this->cacheStore()->put($otpKey, $hashedOtp, now()->addMinutes(5));

        // Set 60-second cooldown for resending
        $this->cacheStore()->put($cooldownKey, now()->addSeconds(60)->timestamp, now()->addSeconds(60));

        // Dispatch OTP notification email
        try {
            $user->notify(new AdminTwoFactorOtpNotification($otp));
        } catch (\Throwable $e) {
            Log::error("Failed to send 2FA OTP email to {$user->email}: " . $e->getMessage(), [
                'exception' => $e
            ]);
        }

        return response()->json([
            'status'              => 'two_factor_required',
            'two_factor_required' => true,
            'two_factor_token'    => $twoFactorToken,
            'email'               => $user->email,
            'role'                => $user->role,
            'message'             => 'Two-Factor Authentication code sent to your registered email address.',
            'expires_in_seconds'  => 300,
            'cooldown_seconds'    => 60,
        ], 200);
    }

    /**
     * Verify the 2FA OTP and issue the Sanctum Bearer API token upon success.
     */
    public function verifyTwoFactor(string $twoFactorToken, string $otp, string $ip): JsonResponse
    {
        $sessionKey = "two_factor:session:{$twoFactorToken}";
        $otpKey = "two_factor:otp:{$twoFactorToken}";
        $cooldownKey = "two_factor:cooldown:{$twoFactorToken}";

        $session = $this->cacheStore()->get($sessionKey);
        if (!$session || !isset($session['user_id'])) {
            return response()->json([
                'message' => 'Two-factor verification session has expired or is invalid. Please log in again.'
            ], 422);
        }

        $attempts = ($session['attempts'] ?? 0) + 1;
        if ($attempts > 5) {
            $this->cacheStore()->forget($sessionKey);
            $this->cacheStore()->forget($otpKey);
            $this->cacheStore()->forget($cooldownKey);

            return response()->json([
                'message' => 'Too many failed verification attempts. Please log in again.'
            ], 429);
        }

        // Update attempt count
        $session['attempts'] = $attempts;
        $this->cacheStore()->put($sessionKey, $session, now()->addMinutes(5));

        $storedHashedOtp = $this->cacheStore()->get($otpKey);
        if (!$storedHashedOtp) {
            return response()->json([
                'message' => 'Verification code has expired. Please request a new code.'
            ], 422);
        }

        $inputHashedOtp = hash('sha256', $otp);
        if (!hash_equals($storedHashedOtp, $inputHashedOtp)) {
            $remainingAttempts = 5 - $attempts;
            $remainingNotice = $remainingAttempts > 0 ? " ({$remainingAttempts} attempts remaining)" : '';
            return response()->json([
                'message' => "Invalid verification code. Please try again{$remainingNotice}."
            ], 422);
        }

        // Clean up cache keys
        $this->cacheStore()->forget($sessionKey);
        $this->cacheStore()->forget($otpKey);
        $this->cacheStore()->forget($cooldownKey);

        /** @var User $user */
        $user = User::find($session['user_id']);
        if (!$user || !$user->is_active) {
            return response()->json(['message' => 'User account not found or deactivated.'], 403);
        }

        // Invalidate prior API tokens and issue fresh Sanctum token
        $user->tokens()->delete();

        $token = $user->createToken(
            'API Token',
            [$user->role],
            now()->addHours(8) // admin tokens expire after 8 hours
        )->plainTextToken;

        return response()->json([
            'token'      => $token,
            'token_type' => 'Bearer',
            'role'       => $user->role,
            'user'       => $user->load('pharmacy'),
        ], 200);
    }

    /**
     * Resend 2FA verification code to admin's registered email with rate-limit cooldown.
     */
    public function resendTwoFactor(string $twoFactorToken): JsonResponse
    {
        $sessionKey = "two_factor:session:{$twoFactorToken}";
        $otpKey = "two_factor:otp:{$twoFactorToken}";
        $cooldownKey = "two_factor:cooldown:{$twoFactorToken}";

        $session = $this->cacheStore()->get($sessionKey);
        if (!$session || !isset($session['user_id'])) {
            return response()->json([
                'message' => 'Two-factor session has expired. Please log in again.'
            ], 422);
        }

        $cooldownExpiresAt = $this->cacheStore()->get($cooldownKey);
        if ($cooldownExpiresAt) {
            $remaining = max(1, (int) ($cooldownExpiresAt - now()->timestamp));
            return response()->json([
                'message'          => "Please wait {$remaining} seconds before requesting a new code.",
                'cooldown_seconds' => $remaining,
            ], 429);
        }

        /** @var User $user */
        $user = User::find($session['user_id']);
        if (!$user || !$user->is_active) {
            return response()->json(['message' => 'User account not found or deactivated.'], 403);
        }

        // Generate new OTP
        $otp = (string) random_int(100000, 999999);
        $hashedOtp = hash('sha256', $otp);

        if (app()->environment('local')) {
            Log::info("Admin 2FA Resend OTP for {$user->email}: {$otp}");
        }

        // Store renewed OTP and cooldown
        $this->cacheStore()->put($otpKey, $hashedOtp, now()->addMinutes(5));
        $this->cacheStore()->put($cooldownKey, now()->addSeconds(60)->timestamp, now()->addSeconds(60));

        try {
            $user->notify(new AdminTwoFactorOtpNotification($otp));
        } catch (\Throwable $e) {
            Log::error("Failed to resend 2FA OTP to {$user->email}: " . $e->getMessage(), [
                'exception' => $e
            ]);
            return response()->json(['message' => 'Failed to send verification email. Please try again.'], 500);
        }

        return response()->json([
            'success'            => true,
            'message'            => 'A new verification code has been sent to your email.',
            'expires_in_seconds' => 300,
            'cooldown_seconds'   => 60,
        ], 200);
    }

    private function ensureIsNotRateLimited(string $ip): void
    {
        if (RateLimiter::tooManyAttempts('admin-login:' . $ip, 5)) {
            $seconds = RateLimiter::availableIn('admin-login:' . $ip);
            abort(429, "Too many login attempts. Try again in {$seconds} seconds.");
        }
    }
}