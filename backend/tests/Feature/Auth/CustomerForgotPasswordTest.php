<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\CustomerForgotPasswordOtpNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CustomerForgotPasswordTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
        Cache::flush();
    }

    public function test_can_request_forgot_password_otp()
    {
        $user = User::factory()->create([
            'email' => 'customer@example.com',
            'role' => 'customer',
        ]);

        $response = $this->postJson('/api/customer/forgot-password/send-otp', [
            'email' => 'customer@example.com',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'OTP has been sent to your registered email address.']);

        Notification::assertSentTo($user, CustomerForgotPasswordOtpNotification::class);
    }

    public function test_cannot_request_otp_for_non_customer()
    {
        User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'super_admin',
        ]);

        $response = $this->postJson('/api/customer/forgot-password/send-otp', [
            'email' => 'admin@example.com',
        ]);

        $response->assertStatus(404);
    }

    public function test_cannot_request_otp_within_60_second_rate_limit()
    {
        User::factory()->create([
            'email' => 'customer@example.com',
            'role' => 'customer',
        ]);

        $this->postJson('/api/customer/forgot-password/send-otp', ['email' => 'customer@example.com']);

        $response = $this->postJson('/api/customer/forgot-password/send-otp', ['email' => 'customer@example.com']);

        $response->assertStatus(429);
    }

    public function test_can_verify_valid_otp_and_receive_reset_token()
    {
        $email = 'customer@example.com';
        User::factory()->create([
            'email' => $email,
            'role' => 'customer',
        ]);

        // Manually place hashed OTP in cache
        $otp = '123456';
        $hashedOtp = hash('sha256', $otp);
        Cache::put("otp:customer:forgot_password:{$email}", $hashedOtp, 300);

        $response = $this->postJson('/api/customer/forgot-password/verify-otp', [
            'email' => $email,
            'otp'   => $otp,
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['message', 'reset_token']);
    }

    public function test_cannot_verify_invalid_otp()
    {
        $email = 'customer@example.com';
        User::factory()->create([
            'email' => $email,
            'role' => 'customer',
        ]);

        Cache::put("otp:customer:forgot_password:{$email}", hash('sha256', '123456'), 300);

        $response = $this->postJson('/api/customer/forgot-password/verify-otp', [
            'email' => $email,
            'otp'   => '654321',
        ]);

        $response->assertStatus(422);
    }

    public function test_can_reset_password_with_valid_reset_token()
    {
        $email = 'customer@example.com';
        $user = User::factory()->create([
            'email' => $email,
            'role' => 'customer',
            'password' => Hash::make('oldpassword123'),
        ]);

        $resetToken = 'sample_secure_reset_token_string';
        Cache::put("password_reset_token:{$email}", hash('sha256', $resetToken), 600);

        $response = $this->postJson('/api/customer/forgot-password/reset-password', [
            'email'                 => $email,
            'reset_token'           => $resetToken,
            'password'              => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Your password has been reset successfully. You may now log in.']);

        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }
}
