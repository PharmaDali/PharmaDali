<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Branch;
use App\Policies\BranchPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Branch::class => BranchPolicy::class,
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
