<?php

namespace Tests\Feature\Order;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Pharmacy;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UploadPaymentReceiptTest extends TestCase
{
    use RefreshDatabase;

    private Pharmacy $pharmacy;
    private User $customerUser;
    private Customer $customer;
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

        $this->customerUser = User::factory()->create([
            'role'        => 'customer',
            'pharmacy_id' => null,
        ]);

        $this->customer = Customer::create([
            'user_id'     => $this->customerUser->id,
            'pharmacy_id' => null,
        ]);

        $this->order = Order::create([
            'order_number'   => 'ORD-TEST-002',
            'pharmacy_id'    => $this->pharmacy->id,
            'customer_id'    => $this->customer->id,
            'status'         => 'ready_for_pickup',
            'payment_method' => 'gcash',
            'payment_status' => 'unpaid',
            'subtotal'       => 150.00,
            'total_amount'   => 150.00,
        ]);
    }

    public function test_successful_payment_receipt_upload_compresses_and_stores_webp_image(): void
    {
        Sanctum::actingAs($this->customerUser, ['customer']);

        // Create a fake JPG image screenshot (1000x2000)
        $fakeImage = UploadedFile::fake()->image('gcash_receipt.jpg', 1000, 2000);

        $response = $this->postJson("/api/customer/orders/{$this->order->id}/payment-receipt", [
            'payment_receipt_image' => $fakeImage,
        ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Customer GCash payment receipt uploaded and compressed successfully.',
                 ]);

        $this->order->refresh();

        $this->assertNotNull($this->order->payment_receipt_image_path);
        $this->assertStringEndsWith('.webp', $this->order->payment_receipt_image_path);

        Storage::disk('public')->assertExists($this->order->payment_receipt_image_path);
    }

    public function test_unauthorized_customer_cannot_upload_payment_receipt_for_another_customer_order(): void
    {
        $otherCustomerUser = User::factory()->create([
            'role'        => 'customer',
            'pharmacy_id' => null,
        ]);

        $otherCustomer = Customer::create([
            'user_id'     => $otherCustomerUser->id,
            'pharmacy_id' => null,
        ]);

        Sanctum::actingAs($otherCustomerUser, ['customer']);

        $fakeImage = UploadedFile::fake()->image('receipt.png', 500, 500);

        $response = $this->postJson("/api/customer/orders/{$this->order->id}/payment-receipt", [
            'payment_receipt_image' => $fakeImage,
        ]);

        $response->assertStatus(403);
    }

    public function test_rate_limiter_throttles_excessive_payment_receipt_uploads(): void
    {
        Sanctum::actingAs($this->customerUser, ['customer']);

        // Send 10 allowed requests
        for ($i = 0; $i < 10; $i++) {
            $fakeImage = UploadedFile::fake()->image("receipt_{$i}.png", 100, 100);
            $res = $this->postJson("/api/customer/orders/{$this->order->id}/payment-receipt", [
                'payment_receipt_image' => $fakeImage,
            ]);
            $res->assertStatus(200);
        }

        // 11th request should trigger rate limit (429 Too Many Requests)
        $extraImage = UploadedFile::fake()->image("receipt_extra.png", 100, 100);
        $response = $this->postJson("/api/customer/orders/{$this->order->id}/payment-receipt", [
            'payment_receipt_image' => $extraImage,
        ]);

        $response->assertStatus(429);
    }
}
