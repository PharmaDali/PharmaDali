<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ResetPasswordWithOtpRequest;
use App\Http\Requests\Auth\SendForgotPasswordOtpRequest;
use App\Http\Requests\Auth\VerifyForgotPasswordOtpRequest;
use App\Services\Auth\PharmacistChangePasswordService;
use Illuminate\Http\JsonResponse;

class PharmacistChangePasswordController extends Controller
{
    public function __construct(
        private readonly PharmacistChangePasswordService $pharmacistChangePasswordService
    ) {}

    public function sendOtp(SendForgotPasswordOtpRequest $request): JsonResponse
    {
        return $this->pharmacistChangePasswordService->sendOtp($request->validated('email'));
    }

    public function verifyOtp(VerifyForgotPasswordOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();
        return $this->pharmacistChangePasswordService->verifyOtp($validated['email'], $validated['otp']);
    }

    public function changePassword(ResetPasswordWithOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();
        return $this->pharmacistChangePasswordService->changePassword(
            $validated['email'],
            $validated['reset_token'],
            $validated['password']
        );
    }
}
