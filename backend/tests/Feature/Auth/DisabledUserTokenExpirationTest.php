<?php

namespace Tests\Feature\Auth;

use App\Models\Customer;
use App\Models\Pharmacist;
use App\Models\Pharmacy;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class DisabledUserTokenExpirationTest extends TestCase
{
    use RefreshDatabase;

    private Pharmacy $pharmacy;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pharmacy = Pharmacy::create([
            'pharmacy_name' => 'Main Test Pharmacy',
            'location' => 'Manila City',
            'contact_number' => '09123456789',
            'email' => 'mainpharmacy@test.com',
            'is_active' => true,
        ]);
    }

    public function test_when_user_is_deactivated_all_tokens_are_immediately_revoked(): void
    {
        $user = User::factory()->create([
            'role' => 'customer',
            'is_active' => true,
        ]);

        $token1 = $user->createToken('Token 1')->plainTextToken;
        $token2 = $user->createToken('Token 2')->plainTextToken;

        $this->assertEquals(2, $user->tokens()->count());

        // Deactivate user
        $user->is_active = false;
        $user->save();

        // Tokens should be deleted by UserObserver
        $this->assertEquals(0, $user->fresh()->tokens()->count());
    }

    public function test_request_with_token_from_deactivated_user_is_rejected_and_token_is_deleted(): void
    {
        $user = User::factory()->create([
            'role' => 'customer',
            'is_active' => false,
        ]);

        // Manually create token for deactivated user
        $plainToken = $user->createToken('API Token', ['customer'])->plainTextToken;
        $this->assertEquals(1, PersonalAccessToken::where('tokenable_id', $user->id)->count());

        $response = $this->withHeader('Authorization', "Bearer {$plainToken}")
            ->getJson('/api/user');

        $response->assertStatus(401);

        // Token must be purged from database
        $this->assertEquals(0, PersonalAccessToken::where('tokenable_id', $user->id)->count());
    }

    public function test_deactivated_customer_cannot_log_in(): void
    {
        $user = User::factory()->create([
            'role' => 'customer',
            'password' => bcrypt('password123'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'Your account has been deactivated. Please contact support.',
        ]);
    }

    public function test_deactivated_pharmacist_cannot_log_in(): void
    {
        $user = User::factory()->create([
            'role' => 'pharmacist',
            'pharmacy_id' => $this->pharmacy->id,
            'password' => bcrypt('password123'),
            'is_active' => false,
        ]);

        $pharmacist = Pharmacist::create([
            'user_id' => $user->id,
            'employee_number' => 'EMP-TEST-999',
            'license_number' => 'LIC-999',
            'permissions' => ['access_pos'],
        ]);

        $response = $this->postJson('/api/pharmacist/login', [
            'employee_number' => 'EMP-TEST-999',
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'Your account has been deactivated. Please contact support.',
        ]);
    }

    public function test_deactivated_admin_cannot_log_in(): void
    {
        $user = User::factory()->create([
            'role' => 'pharmacy_admin',
            'pharmacy_id' => $this->pharmacy->id,
            'password' => bcrypt('password123'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'Your account has been deactivated.',
        ]);
    }
}
