<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Models\Order;
use App\Models\PharmacyProduct;
use App\Models\ProductBatch;
use App\Observers\OrderObserver;
use App\Observers\PharmacyProductObserver;
use App\Observers\ProductBatchObserver;

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
        PharmacyProduct::observe(PharmacyProductObserver::class);
        ProductBatch::observe(ProductBatchObserver::class);
        Order::observe(OrderObserver::class);

        RateLimiter::for('discount-id-upload', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('payment-receipt-upload', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });
    }
}
