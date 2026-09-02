<?php

namespace App\Services\Auth;

use App\Notifications\AdminChangePasswordOtpNotification;
use App\Repositories\UserRepository;
use App\Services\Auth\Actions\ResetPassword;
use App\Services\Auth\Actions\SendPasswordOtp;
use App\Services\Auth\Actions\VerifyPasswordOtp;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class AdminChangePasswordService
{
    use ApiResponseTrait;

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly SendPasswordOtp $sendPasswordOtp,
        private readonly VerifyPasswordOtp $verifyPasswordOtp,
        private readonly ResetPassword $resetPassword,
    ) {}

    public function sendOtp(string $email, string $currentPassword): JsonResponse
    {
        $user = $this->userRepository->findPharmacyAdminByEmail($email);

        if (!$user) {
            return $this->errorResponse('No admin account found with this email address.', 404);
        }

        if (!\Illuminate\Support\Facades\Hash::check($currentPassword, $user->password)) {
            return $this->errorResponse('The provided temporary password is incorrect.', 422);
        }

        return $this->sendPasswordOtp->execute(
            $user,
            "otp:admin:change_password:{$email}",
            "otp:admin:rate_limit:{$email}",
            fn (string $otp) => new AdminChangePasswordOtpNotification($otp)
        );
    }

    public function verifyOtp(string $email, string $otp): JsonResponse
    {
        return $this->verifyPasswordOtp->execute(
            "otp:admin:change_password:{$email}",
            "password_reset_token:admin:{$email}",
            $otp
        );
    }

    public function changePassword(string $email, string $resetToken, string $newPassword): JsonResponse
    {
        $user = $this->userRepository->findPharmacyAdminByEmail($email);

        if (!$user) {
            return $this->errorResponse('Admin account not found.', 404);
        }

        $response = $this->resetPassword->execute(
            $user,
            "password_reset_token:admin:{$email}",
            $resetToken,
            $newPassword,
            'Your password has been changed successfully.'
        );

        // If the reset was successful, ensure requires_password_change is set to false
        if ($response->getData()->status === 'success') {
            $user->update(['requires_password_change' => false]);
        }

        return $response;
    }
}
