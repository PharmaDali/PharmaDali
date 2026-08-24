<?php

namespace Tests\Feature\Security;

use App\Models\Category;
use App\Models\Discount;
use App\Models\Pharmacy;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiThrottlingAndCachingTest extends TestCase
{
    use RefreshDatabase;

    private Pharmacy $pharmacy;
    private User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        Cache::flush();

        $this->pharmacy = Pharmacy::create([
            'pharmacy_name'  => 'Dali Central Pharmacy',
            'location'       => 'Metro Manila',
            'contact_number' => '09123456789',
            'is_active'      => true,
        ]);

        $this->adminUser = User::factory()->create([
            'role'        => 'pharmacy_admin',
            'pharmacy_id' => $this->pharmacy->id,
        ]);
    }

    public function test_customer_registration_rate_limiter_throttles_excessive_attempts(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $res = $this->postJson('/api/customer/register', [
                'name'                  => "Test User {$i}",
                'email'                 => "testuser{$i}@example.com",
                'password'              => 'Password123!',
                'password_confirmation' => 'Password123!',
            ]);
            // Either 200, 201, or validation error 422, but NOT 429
            $this->assertNotEquals(429, $res->status());
        }

        // 6th registration attempt should return 429 Too Many Requests
        $response = $this->postJson('/api/customer/register', [
            'name'                  => 'Excess User',
            'email'                 => 'excess@example.com',
            'password'              => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertStatus(429);
    }

    public function test_otp_verification_rate_limiter_throttles_excessive_attempts(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $res = $this->postJson('/api/customer/forgot-password/verify-otp', [
                'email' => 'customer@example.com',
                'otp'   => '123456',
            ]);
            $this->assertNotEquals(429, $res->status());
        }

        // 6th OTP verification attempt should return 429
        $response = $this->postJson('/api/customer/forgot-password/verify-otp', [
            'email' => 'customer@example.com',
            'otp'   => '123456',
        ]);

        $response->assertStatus(429);
    }

    public function test_pharmacies_list_is_cached_and_invalidated_on_store(): void
    {
        Sanctum::actingAs($this->adminUser, ['pharmacy_admin']);

        $this->assertFalse(Cache::has('pharmacies_all'));

        // First call caches the pharmacies list
        $response = $this->getJson('/api/pharmacies');
        $response->assertStatus(200);
        $this->assertTrue(Cache::has('pharmacies_all'));

        // Creating a new pharmacy invalidates the cache
        $superAdmin = User::factory()->create(['role' => 'super_admin']);
        Sanctum::actingAs($superAdmin, ['super_admin']);

        $this->postJson('/api/pharmacies', [
            'pharmacy_name'  => 'New Branch',
            'location'       => 'Quezon City',
            'contact_number' => '09998887776',
            'is_active'      => true,
        ]);

        $this->assertFalse(Cache::has('pharmacies_all'));
    }

    public function test_discount_list_is_cached_and_invalidated_on_mutation(): void
    {
        Sanctum::actingAs($this->adminUser, ['pharmacy_admin']);

        Discount::create([
            'pharmacy_id' => $this->pharmacy->id,
            'name'        => 'Senior Citizen 20%',
            'type'        => 'senior',
            'percentage'  => 20.00,
            'is_active'   => true,
        ]);

        $cacheKey = "pharmacy_{$this->pharmacy->id}_discounts_active";
        $this->assertFalse(Cache::has($cacheKey));

        $res = $this->getJson('/api/pharmacy/discounts');
        $res->assertStatus(200);
        $this->assertTrue(Cache::has($cacheKey));

        // Creating a new discount clears the cache
        $this->postJson('/api/pharmacy/discounts', [
            'name'       => 'PWD Discount 20%',
            'type'       => 'pwd',
            'percentage' => 20.00,
            'is_active'  => true,
        ]);

        $this->assertFalse(Cache::has($cacheKey));
    }

    public function test_category_list_is_cached_and_invalidated_on_mutation(): void
    {
        Sanctum::actingAs($this->adminUser, ['pharmacy_admin']);

        Category::create([
            'category_name' => 'Vitamins & Supplements',
            'is_enabled'    => true,
        ]);

        $this->assertFalse(Cache::has('admin_categories_all'));

        $res = $this->getJson('/api/pharmacy/categories/all');
        $res->assertStatus(200);
        $this->assertTrue(Cache::has('admin_categories_all'));

        // Creating a new category clears the cache
        $this->postJson('/api/pharmacy/categories/store', [
            'name' => 'Antibiotics',
        ]);

        $this->assertFalse(Cache::has('admin_categories_all'));
    }
}
