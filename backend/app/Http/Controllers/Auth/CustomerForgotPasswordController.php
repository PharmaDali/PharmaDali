<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ResetPasswordWithOtpRequest;
use App\Http\Requests\Auth\SendForgotPasswordOtpRequest;
use App\Http\Requests\Auth\VerifyForgotPasswordOtpRequest;
use App\Services\Auth\ForgotPasswordService;
use Illuminate\Http\JsonResponse;

class CustomerForgotPasswordController extends Controller
{
    public function __construct(
        private readonly ForgotPasswordService $forgotPasswordService
    ) {}

    public function sendOtp(SendForgotPasswordOtpRequest $request): JsonResponse
    {
        return $this->forgotPasswordService->sendOtp($request->validated('email'));
    }

    public function verifyOtp(VerifyForgotPasswordOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();
        return $this->forgotPasswordService->verifyOtp($validated['email'], $validated['otp']);
    }

    public function resetPassword(ResetPasswordWithOtpRequest $request): JsonResponse
    {
        $validated = $request->validated();
        return $this->forgotPasswordService->resetPassword(
            $validated['email'],
            $validated['reset_token'],
            $validated['password']
        );
    }
}
