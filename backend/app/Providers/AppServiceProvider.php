<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use App\Models\PharmacyProduct;
use App\Observers\PharmacyProductObserver;

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
    }
}
