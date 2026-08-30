<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ResetPasswordWithOtpRequest;
use App\Http\Requests\Auth\SendForgotPasswordOtpRequest;
use App\Http\Requests\Auth\VerifyForgotPasswordOtpRequest;
use App\Services\Auth\CustomerChangePasswordService;
use Illuminate\Http\JsonResponse;

class CustomerChangePasswordController extends Controller
{
    public function __construct(
        private readonly CustomerChangePasswordService $customerChangePasswordService
    ) {}

    public function sendOtp(SendForgotPasswordOtpRequest $request): JsonResponse
    {
        return $this->customerChangePasswordService->sendOtp($request->validated('email'));
    }

    public function verifyOtp(VerifyForgotPasswordOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();
        return $this->customerChangePasswordService->verifyOtp($validated['email'], $validated['otp']);
    }

    public function changePassword(ResetPasswordWithOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();
        return $this->customerChangePasswordService->changePassword(
            $validated['email'],
            $validated['reset_token'],
            $validated['password']
        );
    }
}

