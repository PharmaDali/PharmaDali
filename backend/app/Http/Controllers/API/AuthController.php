<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminRegisterRequest;
use App\Http\Requests\CustomerRegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\PharmacistLoginRequest;
use App\Http\Requests\PharmacistRegisterRequest;
use App\Models\User;
use App\Services\Auth\AdminRegisterService;
use App\Services\Auth\CustomerRegisterService;
use App\Services\Auth\LoginService;
use App\Services\Auth\PharmacistLoginService;
use App\Services\Auth\PharmacistRegisterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\AdminLoginRequest;
use App\Services\Auth\AdminLoginService;

class AuthController extends Controller
{
    public function __construct(
        private readonly CustomerRegisterService $customerRegisterService,
        private readonly PharmacistRegisterService $pharmacistRegisterService,
        private readonly AdminRegisterService $adminRegisterService,
        private readonly LoginService           $loginService,
        private readonly PharmacistLoginService $pharmacistLoginService,
        private readonly AdminLoginService      $adminLoginService,
    ) {}

    public function customerRegister(CustomerRegisterRequest $request): JsonResponse
    {
        return $this->customerRegisterService->handle($request->validated());
    }

    public function pharmacistRegister(PharmacistRegisterRequest $request): JsonResponse
    {
        return $this->pharmacistRegisterService->handle(
            $request->validated(),
            $request->user(),
        );
    }

    public function adminRegister(AdminRegisterRequest $request): JsonResponse
    {
        return $this->adminRegisterService->handle($request->validated());
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

        return response()->json($user->load(['pharmacist', 'customer', 'pharmacy']));
    }

    public function logout(Request $request): JsonResponse
    {
        // clear FCM token on logout to stop push notifications to this device
        $request->user()->update(['fcm_token' => null]);
        
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }
}