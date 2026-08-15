<?php

namespace App\Services\Auth;

use App\Notifications\PharmacistChangePasswordOtpNotification;
use App\Repositories\UserRepository;
use App\Services\Auth\Actions\ResetPassword;
use App\Services\Auth\Actions\SendPasswordOtp;
use App\Services\Auth\Actions\VerifyPasswordOtp;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class PharmacistChangePasswordService
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
        $user = $this->userRepository->findPharmacistByEmail($email);

        if (!$user) {
            return $this->errorResponse('No pharmacist account found with this email address.', 404);
        }

        return $this->sendPasswordOtp->execute(
            $user,
            "otp:pharmacist:change_password:{$email}",
            "otp:pharmacist:rate_limit:{$email}",
            fn (string $otp) => new PharmacistChangePasswordOtpNotification($otp)
        );
    }

    public function verifyOtp(string $email, string $otp): JsonResponse
    {
        return $this->verifyPasswordOtp->execute(
            "otp:pharmacist:change_password:{$email}",
            "password_reset_token:pharmacist:{$email}",
            $otp
        );
    }

    public function changePassword(string $email, string $resetToken, string $newPassword): JsonResponse
    {
        $user = $this->userRepository->findPharmacistByEmail($email);

        if (!$user) {
            return $this->errorResponse('Pharmacist account not found.', 404);
        }

        return $this->resetPassword->execute(
            $user,
            "password_reset_token:pharmacist:{$email}",
            $resetToken,
            $newPassword,
            'Your password has been changed successfully. You may now log in.'
        );
    }
}
