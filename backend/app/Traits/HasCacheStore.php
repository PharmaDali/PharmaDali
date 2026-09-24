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
            $store = Cache::store('redis');
            $store->has('ping');
            return $store;
        } catch (\Throwable $e) {
            $cachePath = storage_path('framework/cache/data');
            if (!is_dir($cachePath)) {
                @mkdir($cachePath, 0775, true);
            }
            return Cache::store();
        }
    }
}
