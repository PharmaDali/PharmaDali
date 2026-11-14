<?php

use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\LogEndpointStatusMiddleware;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\SecurityHeadersMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\CheckAbilities;
use Laravel\Sanctum\Http\Middleware\CheckForAnyAbility;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        channels: __DIR__.'/../routes/channels.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(SecurityHeadersMiddleware::class);
        $middleware->append(LogEndpointStatusMiddleware::class);
        $middleware->throttleApi('api');

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'active' => EnsureUserIsActive::class,
            'ability' => CheckForAnyAbility::class,
            'abilities' => CheckAbilities::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(function ($request, $e) {
            return $request->is('api/*') || $request->expectsJson();
        });

        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $bearer = $request->bearerToken();
                if ($bearer) {
                    $rawToken = str_contains($bearer, '|') ? explode('|', $bearer, 2)[1] : $bearer;
                    $hashedToken = hash('sha256', $rawToken);
                    $deactivatedUserId = \Illuminate\Support\Facades\Cache::get("deactivated_token:{$hashedToken}");

                    if ($deactivatedUserId && \App\Models\User::where('id', $deactivatedUserId)->where('is_active', false)->exists()) {
                        return response()->json([
                            'message' => 'Your account has been deactivated. Please contact support.',
                            'deactivated' => true,
                        ], 401);
                    }
                }
            }

            return null;
        });
    })->create();
