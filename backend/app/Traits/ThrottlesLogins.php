<?php

namespace App\Traits;

use Illuminate\Support\Facades\RateLimiter;

trait ThrottlesLogins
{
    private function ensureIsNotRateLimited(string $ip, int $maxAttempts = 5): void
    {
        if (RateLimiter::tooManyAttempts($ip, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($ip);
            abort(429, "Too many login attempts. Please try again in {$seconds} seconds.");
        }
    }
}