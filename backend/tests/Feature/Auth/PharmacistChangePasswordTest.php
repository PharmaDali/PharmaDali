<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\PharmacistChangePasswordOtpNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PharmacistChangePasswordTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
        Cache::flush();
    }

    public function test_can_request_pharmacist_change_password_otp()
    {
        $user = User::factory()->create([
            'email' => 'pharmacist@example.com',
            'role' => 'pharmacist',
        ]);

        $response = $this->postJson('/api/pharmacist/change-password/send-otp', [
            'email' => 'pharmacist@example.com',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'OTP has been sent to your registered email address.']);

        Notification::assertSentTo($user, PharmacistChangePasswordOtpNotification::class);
    }

    public function test_cannot_request_otp_for_non_pharmacist_role()
    {
        User::factory()->create([
            'email' => 'customer@example.com',
            'role' => 'customer',
        ]);

        $response = $this->postJson('/api/pharmacist/change-password/send-otp', [
            'email' => 'customer@example.com',
        ]);

        $response->assertStatus(404);
    }

    public function test_cannot_request_otp_within_60_second_rate_limit()
    {
        User::factory()->create([
            'email' => 'pharmacist@example.com',
            'role' => 'pharmacist',
        ]);

        $this->postJson('/api/pharmacist/change-password/send-otp', ['email' => 'pharmacist@example.com']);

        $response = $this->postJson('/api/pharmacist/change-password/send-otp', ['email' => 'pharmacist@example.com']);

        $response->assertStatus(429);
    }

    public function test_can_verify_valid_pharmacist_otp_and_receive_reset_token()
    {
        $email = 'pharmacist@example.com';
        User::factory()->create([
            'email' => $email,
            'role' => 'pharmacist',
        ]);

        $otp = '654321';
        $hashedOtp = hash('sha256', $otp);
        Cache::put("otp:pharmacist:change_password:{$email}", $hashedOtp, 300);

        $response = $this->postJson('/api/pharmacist/change-password/verify-otp', [
            'email' => $email,
            'otp'   => $otp,
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['message', 'reset_token']);
    }

    public function test_cannot_verify_invalid_pharmacist_otp()
    {
        $email = 'pharmacist@example.com';
        User::factory()->create([
            'email' => $email,
            'role' => 'pharmacist',
        ]);

        Cache::put("otp:pharmacist:change_password:{$email}", hash('sha256', '654321'), 300);

        $response = $this->postJson('/api/pharmacist/change-password/verify-otp', [
            'email' => $email,
            'otp'   => '111111',
        ]);

        $response->assertStatus(422);
    }

    public function test_can_reset_pharmacist_password_with_valid_token()
    {
        $email = 'pharmacist@example.com';
        $user = User::factory()->create([
            'email' => $email,
            'role' => 'pharmacist',
            'password' => Hash::make('oldpassword123'),
        ]);

        $resetToken = 'sample_pharmacist_reset_token_string';
        Cache::put("password_reset_token:pharmacist:{$email}", hash('sha256', $resetToken), 600);

        $response = $this->postJson('/api/pharmacist/change-password/reset-password', [
            'email'                 => $email,
            'reset_token'           => $resetToken,
            'password'              => 'newpharmacistpass123',
            'password_confirmation' => 'newpharmacistpass123',
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Your password has been changed successfully. You may now log in.']);

        $this->assertTrue(Hash::check('newpharmacistpass123', $user->fresh()->password));
    }
}
