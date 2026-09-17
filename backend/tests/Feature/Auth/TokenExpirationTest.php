<?php

namespace Tests\Feature\Auth;

use App\Models\Customer;
use App\Models\Pharmacist;
use App\Models\Pharmacy;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class TokenExpirationTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_login_token_expires_in_30_days(): void
    {
        $user = User::factory()->create([
            'role' => 'customer',
            'email' => 'customer@example.com',
            'password' => bcrypt('password123'),
        ]);

        Customer::create([
            'user_id' => $user->id,
            'first_name' => 'John',
            'last_name' => 'Doe',
            'mobile_number' => '09123456789',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'customer@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);

        $tokenRecord = PersonalAccessToken::where('tokenable_id', $user->id)->first();
        $this->assertNotNull($tokenRecord);
        $this->assertNotNull($tokenRecord->expires_at);

        // Expected to expire in ~30 days (between 29 and 31 days from now)
        $daysUntilExpiration = now()->diffInDays($tokenRecord->expires_at, false);
        $this->assertGreaterThanOrEqual(29, $daysUntilExpiration);
        $this->assertLessThanOrEqual(30, $daysUntilExpiration);
    }

    public function test_customer_register_token_expires_in_30_days(): void
    {
        $response = $this->postJson('/api/customer/register', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'mobile_number' => '09123456788',
            'date_of_birth' => '1995-01-01',
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'jane@example.com')->first();
        $this->assertNotNull($user);

        $tokenRecord = PersonalAccessToken::where('tokenable_id', $user->id)->first();
        $this->assertNotNull($tokenRecord);
        $this->assertNotNull($tokenRecord->expires_at);

        $daysUntilExpiration = now()->diffInDays($tokenRecord->expires_at, false);
        $this->assertGreaterThanOrEqual(29, $daysUntilExpiration);
        $this->assertLessThanOrEqual(30, $daysUntilExpiration);
    }

    public function test_pharmacist_login_token_expires_in_14_days(): void
    {
        $pharmacy = Pharmacy::create([
            'pharmacy_name' => 'PharmaDali Branch',
            'location' => 'Manila',
            'contact_number' => '09123456789',
            'email' => 'branch@pharmadali.com',
        ]);

        $user = User::factory()->create([
            'role' => 'pharmacist',
            'pharmacy_id' => $pharmacy->id,
            'password' => bcrypt('pharma123'),
        ]);

        $pharmacist = Pharmacist::create([
            'user_id' => $user->id,
            'employee_number' => 'EMP-100',
        ]);

        $response = $this->postJson('/api/pharmacist/login', [
            'employee_number' => 'EMP-100',
            'password' => 'pharma123',
        ]);

        $response->assertStatus(200);

        $tokenRecord = PersonalAccessToken::where('tokenable_id', $user->id)->first();
        $this->assertNotNull($tokenRecord);
        $this->assertNotNull($tokenRecord->expires_at);

        // Expected to expire in ~14 days (between 13 and 14 days from now)
        $daysUntilExpiration = now()->diffInDays($tokenRecord->expires_at, false);
        $this->assertGreaterThanOrEqual(13, $daysUntilExpiration);
        $this->assertLessThanOrEqual(14, $daysUntilExpiration);
    }

    public function test_admin_login_token_expires_in_8_hours(): void
    {
        $pharmacy = Pharmacy::create([
            'pharmacy_name' => 'Admin Branch',
            'location' => 'Manila',
            'contact_number' => '09123456789',
            'email' => 'adminbranch@pharmadali.com',
        ]);

        $admin = User::factory()->create([
            'role' => 'pharmacy_admin',
            'pharmacy_id' => $pharmacy->id,
            'password' => bcrypt('admin123'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email' => $admin->email,
            'password' => 'admin123',
        ]);

        $response->assertStatus(200);

        $tokenRecord = PersonalAccessToken::where('tokenable_id', $admin->id)->first();
        $this->assertNotNull($tokenRecord);
        $this->assertNotNull($tokenRecord->expires_at);

        // Expected to expire in ~8 hours
        $hoursUntilExpiration = now()->diffInHours($tokenRecord->expires_at, false);
        $this->assertGreaterThanOrEqual(7, $hoursUntilExpiration);
        $this->assertLessThanOrEqual(8, $hoursUntilExpiration);
    }
}
