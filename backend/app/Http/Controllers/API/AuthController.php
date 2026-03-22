<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\PharmacistLoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Services\Auth\LoginService;
use App\Services\Auth\PharmacistLoginService;
use App\Services\Auth\RegisterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\AdminLoginRequest;
use App\Services\Auth\AdminLoginService;

class AuthController extends Controller
{
    public function __construct(
        private readonly LoginService           $loginService,
        private readonly PharmacistLoginService $pharmacistLoginService,
        private readonly RegisterService        $registerService,
        private readonly AdminLoginService      $adminLoginService,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        return $this->registerService->handle($request->validated());
    }

    public function login(LoginRequest $request): JsonResponse
    {
        return $this->loginService->handle(
            $request->validated(),
            $request->ip()
        );
    }

    public function pharmacistLogin(PharmacistLoginRequest $request): JsonResponse
    {
        return $this->pharmacistLoginService->handle(
            $request->validated(),
            $request->ip()
        );
    }

    public function adminLogin(AdminLoginRequest $request): JsonResponse
    {
        return $this->adminLoginService->handle(
            $request->validated(),
            $request->ip(),
            $request->userAgent() ?? 'Unknown'
        );
    }

    public function userInfo(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json($user->load('pharmacist'));
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}