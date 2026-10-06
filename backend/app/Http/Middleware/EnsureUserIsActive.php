<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     * If the authenticated user is deactivated/disabled, revoke their tokens
     * and immediately reject the request with 401 Unauthorized so that all frontend
     * applications (admin, pharmacist, customer, super-admin) clear their session.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->is_active) {
            $user->tokens()->delete();
            $user->updateQuietly(['fcm_token' => null]);

            return response()->json([
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 401);
        }

        return $next($request);
    }
}
