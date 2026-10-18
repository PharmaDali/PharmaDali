<?php

$rawOrigins = env('CORS_ALLOWED_ORIGINS', '*');
$allowedOrigins = $rawOrigins === '*'
    ? ['*']
    : array_values(array_filter(array_map('trim', explode(',', (string) $rawOrigins))));

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Set CORS_ALLOWED_ORIGINS in your production .env to a comma-separated
    | list of trusted web frontend domains (e.g. https://pharmadali.com,
    | https://admin.pharmadali.com) so third-party websites cannot call the API
    | from a browser.
    |
    */

    'paths' => ['api/*', 'broadcasting/auth', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $allowedOrigins,

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,

];

