<?php

namespace Tests\Feature\Order;

use App\Models\Order;
use App\Models\Pharmacy;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UploadDiscountIdTest extends TestCase
{
    use RefreshDatabase;

    private Pharmacy $pharmacy;
    private User $user;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->pharmacy = Pharmacy::create([
            'pharmacy_name'  => 'Dali Pharmacy',
            'location'       => 'Downtown',
            'contact_number' => '09123456789',
            'is_active'      => true,
        ]);

        $this->user = User::factory()->create([
            'pharmacy_id' => $this->pharmacy->id,
            'role'        => 'pharmacy_admin',
        ]);

        $this->order = Order::create([
            'order_number'        => 'ORD-TEST-001',
            'pharmacy_id'         => $this->pharmacy->id,
            'status'              => 'ready_for_pickup',
            'payment_method'      => 'cash',
            'payment_status'      => 'unpaid',
            'subtotal'            => 100.00,
            'total_amount'        => 80.00,
            'discount_type'       => 'senior',
            'discount_percentage' => 20.00,
            'discount_id_number'  => 'SENIOR-12345',
            'discount_amount'     => 20.00,
        ]);
    }

    public function test_successful_discount_id_upload_compresses_and_stores_webp_image(): void
    {
        Sanctum::actingAs($this->user, ['pharmacy_admin']);

        // Create a large fake JPG image (2000x2000)
        $fakeImage = UploadedFile::fake()->image('senior_id.jpg', 2000, 2000);

        $response = $this->postJson("/api/pos/orders/{$this->order->id}/discount-id", [
            'discount_id_image' => $fakeImage,
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Discount customer ID uploaded and compressed successfully.',
                 ]);

        $this->order->refresh();

        $this->assertNotNull($this->order->discount_id_image_path);
        $this->assertStringEndsWith('.webp', $this->order->discount_id_image_path);

        Storage::disk('public')->assertExists($this->order->discount_id_image_path);
    }

    public function test_unauthorized_pharmacy_user_cannot_upload_discount_id(): void
    {
        $otherPharmacy = Pharmacy::create([
            'pharmacy_name'  => 'Other Pharmacy',
            'location'       => 'Uptown',
            'contact_number' => '09987654321',
            'is_active'      => true,
        ]);

        $otherUser = User::factory()->create([
            'pharmacy_id' => $otherPharmacy->id,
            'role'        => 'pharmacy_admin',
        ]);

        Sanctum::actingAs($otherUser, ['pharmacy_admin']);

        $fakeImage = UploadedFile::fake()->image('id.png', 500, 500);

        $response = $this->postJson("/api/pos/orders/{$this->order->id}/discount-id", [
            'discount_id_image' => $fakeImage,
        ]);

        $this->assertTrue(in_array($response->status(), [403, 404]));
    }

    public function test_rate_limiter_throttles_excessive_uploads(): void
    {
        Sanctum::actingAs($this->user, ['pharmacy_admin']);

        // Send 10 allowed requests
        for ($i = 0; $i < 10; $i++) {
            $fakeImage = UploadedFile::fake()->image("id_{$i}.png", 100, 100);
            $res = $this->postJson("/api/pos/orders/{$this->order->id}/discount-id", [
                'discount_id_image' => $fakeImage,
            ]);
            $res->assertStatus(200);
        }

        // 11th request should trigger rate limit (429 Too Many Requests)
        $extraImage = UploadedFile::fake()->image("id_extra.png", 100, 100);
        $response = $this->postJson("/api/pos/orders/{$this->order->id}/discount-id", [
            'discount_id_image' => $extraImage,
        ]);

        $response->assertStatus(429);
    }
}
