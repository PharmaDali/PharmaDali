<?php

namespace App\Services\Auth;

use App\Notifications\CustomerForgotPasswordOtpNotification;
use App\Repositories\UserRepository;
use App\Services\Auth\Actions\ResetPassword;
use App\Services\Auth\Actions\SendPasswordOtp;
use App\Services\Auth\Actions\VerifyPasswordOtp;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class ForgotPasswordService
{
    use ApiResponseTrait;

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly SendPasswordOtp $sendPasswordOtp,
        private readonly VerifyPasswordOtp $verifyPasswordOtp,
        private readonly ResetPassword $resetPassword,
    ) {}

    public function sendOtp(string $email): JsonResponse
    {
        $user = $this->userRepository->findCustomerByEmail($email);

        if (!$user) {
            return $this->errorResponse('No customer account found with this email address.', 404);
        }

        return $this->sendPasswordOtp->execute(
            $user,
            "otp:customer:forgot_password:{$email}",
            "otp:customer:rate_limit:{$email}",
            fn (string $otp) => new CustomerForgotPasswordOtpNotification($otp)
        );
    }

    public function verifyOtp(string $email, string $otp): JsonResponse
    {
        return $this->verifyPasswordOtp->execute(
            "otp:customer:forgot_password:{$email}",
            "password_reset_token:{$email}",
            $otp
        );
    }

    public function resetPassword(string $email, string $resetToken, string $newPassword): JsonResponse
    {
        $user = $this->userRepository->findCustomerByEmail($email);

        if (!$user) {
            return $this->errorResponse('Customer account not found.', 404);
        }

        return $this->resetPassword->execute(
            $user,
            "password_reset_token:{$email}",
            $resetToken,
            $newPassword,
            'Your password has been reset successfully. You may now log in.'
        );
    }
}
