<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\Pharmacy;
use App\Models\Conversation;
use App\Models\Cart;
use App\Models\Pharmacist;
use App\Models\Order;
use App\Models\PharmacyProduct;
use App\Policies\PharmacyPolicy;
use App\Policies\ConversationPolicy;
use App\Policies\CartPolicy;
use App\Policies\PharmacistPolicy;
use App\Policies\OrderPolicy;
use App\Policies\PharmacyProductPolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Pharmacy::class => PharmacyPolicy::class,
        Cart::class => CartPolicy::class,
        Conversation::class => ConversationPolicy::class,
        Pharmacist::class => PharmacistPolicy::class,
        Order::class => OrderPolicy::class,
        PharmacyProduct::class => PharmacyProductPolicy::class,
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
        $this->registerPolicies();
    }
}
