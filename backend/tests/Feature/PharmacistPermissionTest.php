<?php

namespace Tests\Feature;

use App\Models\Pharmacist;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PharmacistPermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_has_all_permissions_automatically(): void
    {
        $admin = User::factory()->create([
            'role' => 'pharmacy_admin',
        ]);

        $this->assertTrue($admin->hasPermission('access_pos'));
        $this->assertTrue($admin->hasPermission('manage_inventory'));
        $this->assertTrue($admin->hasPermission('view_analytics'));
        $this->assertTrue($admin->hasPermission('process_item_exchange'));
    }

    public function test_pharmacist_uses_default_permissions_when_null(): void
    {
        $user = User::factory()->create([
            'role' => 'pharmacist',
        ]);

        $pharmacist = Pharmacist::create([
            'user_id' => $user->id,
            'employee_number' => 'EMP-001',
            'permissions' => null,
        ]);

        $user->refresh();

        $this->assertTrue($user->hasPermission('access_pos'));
        $this->assertTrue($user->hasPermission('access_pickup'));
        $this->assertTrue($user->hasPermission('view_inventory'));
        $this->assertTrue($user->hasPermission('view_sales_reports'));
        $this->assertTrue($user->hasPermission('process_item_exchange'));
        $this->assertFalse($user->hasPermission('manage_inventory'));
        $this->assertFalse($user->hasPermission('view_analytics'));
    }

    public function test_pharmacist_custom_permissions(): void
    {
        $user = User::factory()->create([
            'role' => 'pharmacist',
        ]);

        $pharmacist = Pharmacist::create([
            'user_id' => $user->id,
            'employee_number' => 'EMP-002',
            'permissions' => ['access_pos', 'view_inventory'],
        ]);

        $user->refresh();

        $this->assertTrue($user->hasPermission('access_pos'));
        $this->assertTrue($user->hasPermission('view_inventory'));
        $this->assertFalse($user->hasPermission('access_pickup'));
        $this->assertFalse($user->hasPermission('view_sales_reports'));
        $this->assertFalse($user->hasPermission('process_item_exchange'));
    }

    public function test_admin_can_update_pharmacist_permissions_via_endpoint(): void
    {
        $pharmacy = \App\Models\Pharmacy::create([
            'pharmacy_name' => 'Test Pharmacy',
            'location' => 'Manila',
            'contact_number' => '09123456789',
            'email' => 'test@pharmadali.com',
        ]);

        $admin = User::factory()->create([
            'role' => 'pharmacy_admin',
            'pharmacy_id' => $pharmacy->id,
        ]);

        $pharmacistUser = User::factory()->create([
            'role' => 'pharmacist',
            'pharmacy_id' => $pharmacy->id,
        ]);

        $response = $this->actingAs($admin)
            ->putJson("/api/pharmacists/{$pharmacistUser->id}/permissions", [
                'permissions' => ['access_pos', 'process_item_exchange'],
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Pharmacist permissions updated successfully.',
            ]);

        $pharmacistUser->refresh();
        $this->assertTrue($pharmacistUser->hasPermission('access_pos'));
        $this->assertTrue($pharmacistUser->hasPermission('process_item_exchange'));
        $this->assertFalse($pharmacistUser->hasPermission('view_sales_reports'));
    }

    public function test_pharmacist_can_login_to_web_portal_via_admin_login_endpoint(): void
    {
        $pharmacy = \App\Models\Pharmacy::create([
            'pharmacy_name' => 'Test Pharmacy',
            'location' => 'Manila',
            'contact_number' => '09123456789',
            'email' => 'test@pharmadali.com',
        ]);

        $pharmacistUser = User::factory()->create([
            'role' => 'pharmacist',
            'pharmacy_id' => $pharmacy->id,
            'password' => bcrypt('secret123'),
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/admin/login', [
            'email' => $pharmacistUser->email,
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'token_type',
                'role',
                'user',
            ]);

        $this->assertEquals('pharmacist', $response->json('role'));
    }

    public function test_pharmacist_sales_report_queries_filter_by_verified_by_without_sql_errors(): void
    {
        $pharmacy = \App\Models\Pharmacy::create([
            'pharmacy_name' => 'Test Pharmacy',
            'location' => 'Manila',
            'contact_number' => '09123456789',
            'email' => 'test@pharmadali.com',
        ]);

        $pharmacistUser = User::factory()->create([
            'role' => 'pharmacist',
            'pharmacy_id' => $pharmacy->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($pharmacistUser)
            ->getJson('/api/pharmacy/reports/sales');

        $response->assertStatus(200);
    }

    public function test_pharmacist_is_blocked_from_stockout_and_batch_edits(): void
    {
        $pharmacy = \App\Models\Pharmacy::create([
            'pharmacy_name' => 'Test Pharmacy',
            'location' => 'Manila',
            'contact_number' => '09123456789',
            'email' => 'test@pharmadali.com',
        ]);

        $pharmacistUser = User::factory()->create([
            'role' => 'pharmacist',
            'pharmacy_id' => $pharmacy->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($pharmacistUser)
            ->postJson('/api/pharmacy/inventory/products/1/stock-out', [
                'quantity' => 5,
            ]);

        $response->assertStatus(403);
    }
}
