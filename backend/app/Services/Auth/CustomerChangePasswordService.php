<?php

namespace App\Services\Auth;

use App\Notifications\CustomerChangePasswordOtpNotification;
use App\Repositories\UserRepository;
use App\Services\Auth\Actions\ResetPassword;
use App\Services\Auth\Actions\SendPasswordOtp;
use App\Services\Auth\Actions\VerifyPasswordOtp;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class CustomerChangePasswordService
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
            "otp:customer:change_password:{$email}",
            "otp:customer:change_password_rate_limit:{$email}",
            fn (string $otp) => new CustomerChangePasswordOtpNotification($otp)
        );
    }

    public function verifyOtp(string $email, string $otp): JsonResponse
    {
        return $this->verifyPasswordOtp->execute(
            "otp:customer:change_password:{$email}",
            "password_reset_token:customer:{$email}",
            $otp
        );
    }

    public function changePassword(string $email, string $resetToken, string $newPassword): JsonResponse
    {
        $user = $this->userRepository->findCustomerByEmail($email);

        if (!$user) {
            return $this->errorResponse('Customer account not found.', 404);
        }

        return $this->resetPassword->execute(
            $user,
            "password_reset_token:customer:{$email}",
            $resetToken,
            $newPassword,
            'Your password has been changed successfully. You may now log in.'
        );
    }
}

