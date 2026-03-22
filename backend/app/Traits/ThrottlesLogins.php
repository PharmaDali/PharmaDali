<?php

namespace App\Traits;

use Illuminate\Support\Facades\RateLimiter;

trait ThrottlesLogins
{
    private function ensureIsNotRateLimited(string $key, int $maxAttempts = 5): void
    {
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);
            abort(429, "Too many login attempts. Please try again in {$seconds} seconds.");
        }
    }
}