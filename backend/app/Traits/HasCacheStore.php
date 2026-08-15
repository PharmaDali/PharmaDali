<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

trait HasCacheStore
{
    /**
     * Get the cache store instance (defaults to redis if available).
     */
    protected function cacheStore()
    {
        if (app()->environment('testing')) {
            return Cache::store();
        }

        try {
            return Cache::store('redis');
        } catch (\Throwable $e) {
            return Cache::store();
        }
    }
}
