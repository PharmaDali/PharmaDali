<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Models\Order;
use App\Models\PharmacyProduct;
use App\Models\ProductBatch;
use App\Models\User;
use App\Observers\OrderObserver;
use App\Observers\PharmacyProductObserver;
use App\Observers\ProductBatchObserver;
use App\Observers\UserObserver;
use Laravel\Sanctum\Sanctum;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        User::observe(UserObserver::class);
        PharmacyProduct::observe(PharmacyProductObserver::class);
        ProductBatch::observe(ProductBatchObserver::class);
        Order::observe(OrderObserver::class);

        // Instantly revoke and reject access tokens for deactivated users across all platforms
        Sanctum::authenticateAccessTokensUsing(function ($accessToken, $isValid) {
            if (!$isValid) {
                return false;
            }

            $user = $accessToken->tokenable;
            if ($user instanceof User && !$user->is_active) {
                $accessToken->delete();
                return false;
            }

            return true;
        });

        RateLimiter::for('discount-id-upload', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('payment-receipt-upload', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth-register', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('otp-verify', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('file-upload', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('csv-pdf-export', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('batch-import', function (Request $request) {
            return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip());
        });
    }
}
