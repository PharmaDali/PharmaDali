<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ResetPasswordWithOtpRequest;
use App\Http\Requests\Auth\SendAdminChangePasswordOtpRequest;
use App\Http\Requests\Auth\VerifyForgotPasswordOtpRequest;
use App\Services\Auth\AdminChangePasswordService;
use Illuminate\Http\JsonResponse;

class AdminChangePasswordController extends Controller
{
    public function __construct(
        private readonly AdminChangePasswordService $adminChangePasswordService
    ) {}

    public function sendOtp(SendAdminChangePasswordOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();
        return $this->adminChangePasswordService->sendOtp($validated['email'], $validated['current_password']);
    }

    public function verifyOtp(VerifyForgotPasswordOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();
        return $this->adminChangePasswordService->verifyOtp($validated['email'], $validated['otp']);
    }

    public function changePassword(ResetPasswordWithOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();
        return $this->adminChangePasswordService->changePassword(
            $validated['email'],
            $validated['reset_token'],
            $validated['password']
        );
    }
}
