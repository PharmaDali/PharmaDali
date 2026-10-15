<?php

namespace Tests\Feature\Media;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemPrescription;
use App\Models\Pharmacy;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PrivateMediaTest extends TestCase
{
    use RefreshDatabase;

    private Pharmacy $pharmacy;
    private User $pharmacistUser;
    private User $customerUser;
    private Customer $customer;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        Storage::fake('public');

        $this->pharmacy = Pharmacy::create([
            'pharmacy_name'  => 'Dali Pharmacy',
            'location'       => 'Downtown',
            'contact_number' => '09123456789',
            'is_active'      => true,
        ]);

        $this->pharmacistUser = User::factory()->create([
            'role'        => 'pharmacist',
            'pharmacy_id' => $this->pharmacy->id,
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
            'order_number'               => 'ORD-PRIVATE-001',
            'pharmacy_id'                => $this->pharmacy->id,
            'customer_id'                => $this->customer->id,
            'status'                     => 'pending',
            'payment_method'             => 'gcash',
            'payment_status'             => 'unpaid',
            'subtotal'                   => 200.00,
            'total_amount'               => 200.00,
            'discount_id_image_path'     => 'discount_ids/1/discount_test.webp',
            'payment_receipt_image_path' => 'payment_receipts/1/receipt_test.webp',
        ]);
    }

    public function test_valid_signed_url_allows_media_access(): void
    {
        $filePath = 'prescriptions/order-items/rx_valid.jpg';
        Storage::disk('local')->put($filePath, 'dummy prescription content');

        $signedUrl = URL::temporarySignedRoute('media.private', now()->addMinutes(10), ['path' => $filePath]);

        $response = $this->get($signedUrl);

        $response->assertStatus(200);
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $this->assertStringContainsString('sandbox', $response->headers->get('Content-Security-Policy'));
    }

    public function test_unsigned_request_without_auth_is_rejected(): void
    {
        $filePath = 'prescriptions/order-items/rx_secret.jpg';
        Storage::disk('local')->put($filePath, 'secret rx');

        $response = $this->getJson("/api/media/private/{$filePath}");

        $response->assertStatus(403);
    }

    public function test_expired_signed_url_is_rejected(): void
    {
        $filePath = 'prescriptions/order-items/rx_expired.jpg';
        Storage::disk('local')->put($filePath, 'expired content');

        $expiredUrl = URL::temporarySignedRoute('media.private', now()->subMinutes(1), ['path' => $filePath]);

        $response = $this->get($expiredUrl);

        $response->assertStatus(403);
    }

    public function test_directory_traversal_is_blocked(): void
    {
        $response = $this->get('/api/media/private/prescriptions/../.env');

        $this->assertTrue(in_array($response->status(), [403, 404]));
    }

    public function test_disallowed_prefix_is_rejected(): void
    {
        $response = $this->get('/api/media/private/system_secrets/config.json');

        $response->assertStatus(403);
    }

    public function test_pharmacist_can_access_media_with_sanctum_token(): void
    {
        $filePath = 'payment_receipts/1/receipt_test.webp';
        Storage::disk('local')->put($filePath, 'receipt image content');

        Sanctum::actingAs($this->pharmacistUser, ['pharmacist']);

        $response = $this->get("/api/media/private/{$filePath}");

        $response->assertStatus(200);
    }

    public function test_customer_can_access_own_order_media(): void
    {
        $filePath = 'discount_ids/1/discount_test.webp';
        Storage::disk('local')->put($filePath, 'discount id content');

        Sanctum::actingAs($this->customerUser, ['customer']);

        $response = $this->get("/api/media/private/{$filePath}");

        $response->assertStatus(200);
    }

    public function test_customer_cannot_access_another_customers_order_media(): void
    {
        $filePath = 'discount_ids/1/discount_test.webp';
        Storage::disk('local')->put($filePath, 'discount id content');

        $otherCustomerUser = User::factory()->create([
            'role'        => 'customer',
            'pharmacy_id' => null,
        ]);

        Customer::create([
            'user_id'     => $otherCustomerUser->id,
            'pharmacy_id' => null,
        ]);

        Sanctum::actingAs($otherCustomerUser, ['customer']);

        $response = $this->get("/api/media/private/{$filePath}");

        $response->assertStatus(403);
    }
}
