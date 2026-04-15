<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Branch;
use App\Models\Cart;
use App\Models\Pharmacist;
use App\Policies\BranchPolicy;
use App\Policies\CartPolicy;
use App\Policies\PharmacistPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Branch::class => BranchPolicy::class,
        Cart::class => CartPolicy::class,
        Pharmacist::class => PharmacistPolicy::class,
    ];

    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
