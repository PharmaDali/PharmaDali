<?php

namespace Tests\Feature\Order;

use App\Models\Category;
use App\Models\Conversation;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemPrescription;
use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use App\Models\Products;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UploadSensitiveMediaEndpointsTest extends TestCase
{
    use RefreshDatabase;

    private Pharmacy $pharmacy;
    private User $customerUser;
    private Customer $customer;
    private User $pharmacistUser;
    private Order $order;
    private OrderItem $orderItem;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        Storage::fake('public');

        $this->pharmacy = Pharmacy::create([
            'pharmacy_name'  => 'Dali Central Pharmacy',
            'location'       => 'Downtown Mall',
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

        $this->pharmacistUser = User::factory()->create([
            'role'        => 'pharmacist',
            'pharmacy_id' => $this->pharmacy->id,
        ]);

        $category = Category::create([
            'category_name' => 'Prescription Drugs',
            'is_active'     => true,
        ]);

        $product = Products::create([
            'product_name'   => 'Amoxicillin 500mg',
            'brand_name'     => 'Amoxil',
            'generic_name'   => 'Amoxicillin',
            'dosage'         => '500mg',
            'is_prescribed'  => true,
            'image_path'     => 'products/amox.jpg',
        ]);

        $pharmacyProduct = PharmacyProduct::create([
            'pharmacy_id'    => $this->pharmacy->id,
            'product_id'     => $product->id,
            'category_id'    => $category->id,
            'selling_price'  => 25.00,
            'stock'          => 100,
            'is_discountable'=> true,
            'is_active'      => true,
        ]);

        $this->order = Order::create([
            'order_number'        => 'ORD-UPLOAD-TEST-001',
            'pharmacy_id'         => $this->pharmacy->id,
            'customer_id'         => $this->customer->id,
            'status'              => 'pending',
            'payment_method'      => 'gcash',
            'payment_status'      => 'unpaid',
            'subtotal'            => 100.00,
            'total_amount'        => 80.00,
            'discount_type'       => 'senior',
            'discount_percentage' => 20.00,
            'discount_id_number'  => 'SENIOR-999',
            'discount_amount'     => 20.00,
            'placed_at'           => now(),
        ]);

        $this->orderItem = OrderItem::create([
            'order_id'             => $this->order->id,
            'pharmacy_product_id'  => $pharmacyProduct->id,
            'product_name'         => 'Amoxicillin 500mg',
            'quantity'             => 4,
            'unit_price_snapshot'  => 25.00,
            'line_total'           => 100.00,
        ]);
    }

    public function test_upload_order_item_prescription_stores_to_private_storage(): void
    {
        Sanctum::actingAs($this->customerUser, ['customer']);

        $fakePrescription = UploadedFile::fake()->image('my_doctor_prescription.jpg', 1200, 1600);

        $response = $this->postJson("/api/customer/order-items/{$this->orderItem->id}/prescription", [
            'prescription_image' => $fakePrescription,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status'  => 'success',
                'message' => 'Prescription image uploaded successfully.',
            ]);

        $data = $response->json('data');
        $this->assertNotEmpty($data['prescription_image_path']);
        $this->assertNotEmpty($data['prescription_image_url']);
        $this->assertStringContainsString('prescriptions/order-items/', $data['prescription_image_path']);

        // Assert file exists on local (private) disk and NOT on public disk
        Storage::disk('local')->assertExists($data['prescription_image_path']);
        Storage::disk('public')->assertMissing($data['prescription_image_path']);

        // Assert signed URL is accessible
        $streamResponse = $this->get($data['prescription_image_url']);
        $streamResponse->assertStatus(200);
        $this->assertStringContainsString('no-store', $streamResponse->headers->get('Cache-Control'));
    }

    public function test_upload_discount_id_stores_to_private_storage(): void
    {
        Sanctum::actingAs($this->customerUser, ['customer']);

        $fakeIdImage = UploadedFile::fake()->image('pwd_card.png', 1000, 800);

        $response = $this->postJson("/api/customer/orders/{$this->order->id}/discount-id", [
            'discount_id_image'  => $fakeIdImage,
            'discount_type'      => 'pwd',
            'discount_id_number' => 'PWD-54321',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Discount customer ID uploaded and compressed successfully.',
            ]);

        $this->order->refresh();
        $this->assertNotNull($this->order->discount_id_image_path);
        $this->assertNotNull($this->order->discount_id_image_url);
        $this->assertStringEndsWith('.webp', $this->order->discount_id_image_path);

        // Assert file exists on local (private) disk and NOT on public disk
        Storage::disk('local')->assertExists($this->order->discount_id_image_path);
        Storage::disk('public')->assertMissing($this->order->discount_id_image_path);

        // Assert signed URL streams file successfully
        $streamResponse = $this->get($this->order->discount_id_image_url);
        $streamResponse->assertStatus(200);
    }

    public function test_upload_payment_receipt_stores_to_private_storage(): void
    {
        Sanctum::actingAs($this->customerUser, ['customer']);

        $fakeReceipt = UploadedFile::fake()->image('gcash_ref_123.jpg', 1080, 1920);

        $response = $this->postJson("/api/customer/orders/{$this->order->id}/payment-receipt", [
            'payment_receipt_image' => $fakeReceipt,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Customer GCash payment receipt uploaded and compressed successfully.',
            ]);

        $this->order->refresh();
        $this->assertNotNull($this->order->payment_receipt_image_path);
        $this->assertNotNull($this->order->payment_receipt_image_url);
        $this->assertStringEndsWith('.webp', $this->order->payment_receipt_image_path);

        // Assert file exists on local (private) disk and NOT on public disk
        Storage::disk('local')->assertExists($this->order->payment_receipt_image_path);
        Storage::disk('public')->assertMissing($this->order->payment_receipt_image_path);

        // Assert signed URL streams file successfully
        $streamResponse = $this->get($this->order->payment_receipt_image_url);
        $streamResponse->assertStatus(200);
    }

    public function test_send_chat_message_with_image_stores_to_private_storage(): void
    {
        $conversation = Conversation::create([
            'order_id'         => $this->order->id,
            'customer_user_id' => $this->customerUser->id,
            'pharmacy_id'      => $this->pharmacy->id,
            'status'           => 'open',
        ]);

        Sanctum::actingAs($this->customerUser, ['customer']);

        $fakeChatImage = UploadedFile::fake()->image('rash_symptom.jpg', 800, 600);

        $response = $this->post("/api/customer/messages/conversations/{$conversation->id}/messages", [
            'body'  => 'Here is the affected area',
            'image' => $fakeChatImage,
        ]);

        $response->assertStatus(201);

        $messageData = $response->json('data');
        $this->assertNotNull($messageData['metadata']);
        $imagePath = $messageData['metadata']['image_path'];
        $imageUrl = $messageData['metadata']['image_url'];

        $this->assertStringStartsWith('chat_images/', $imagePath);
        $this->assertNotEmpty($imageUrl);

        // Assert file exists on local disk and NOT on public disk
        Storage::disk('local')->assertExists($imagePath);
        Storage::disk('public')->assertMissing($imagePath);

        // Assert signed URL streams file successfully
        $streamResponse = $this->get($imageUrl);
        $streamResponse->assertStatus(200);
    }

    public function test_prescription_reupload_deletes_previous_image_from_private_storage(): void
    {
        Sanctum::actingAs($this->customerUser, ['customer']);

        // First upload
        $firstImage = UploadedFile::fake()->image('prescription_v1.jpg', 800, 800);
        $res1 = $this->postJson("/api/customer/order-items/{$this->orderItem->id}/prescription", [
            'prescription_image' => $firstImage,
        ]);
        $res1->assertStatus(200);
        $path1 = $res1->json('data.prescription_image_path');
        Storage::disk('local')->assertExists($path1);

        // Second upload (re-upload)
        $secondImage = UploadedFile::fake()->image('prescription_v2.jpg', 800, 800);
        $res2 = $this->postJson("/api/customer/order-items/{$this->orderItem->id}/prescription", [
            'prescription_image' => $secondImage,
        ]);
        $res2->assertStatus(200);
        $path2 = $res2->json('data.prescription_image_path');

        // Path 1 should be cleaned up, and Path 2 should exist
        $this->assertNotEquals($path1, $path2);
        Storage::disk('local')->assertMissing($path1);
        Storage::disk('local')->assertExists($path2);
    }

    public function test_pharmacist_can_send_chat_message_with_image_to_private_storage(): void
    {
        $conversation = Conversation::create([
            'order_id'                    => $this->order->id,
            'customer_user_id'            => $this->customerUser->id,
            'pharmacy_id'                 => $this->pharmacy->id,
            'assigned_pharmacist_user_id' => $this->pharmacistUser->id,
            'status'                      => 'open',
        ]);

        Sanctum::actingAs($this->pharmacistUser, ['pharmacist']);

        $fakePharmacistImage = UploadedFile::fake()->image('medicine_instruction.jpg', 800, 600);

        $response = $this->post("/api/pharmacist/messages/conversations/{$conversation->id}/messages", [
            'body'  => 'Here is the dosage label',
            'image' => $fakePharmacistImage,
        ]);

        $response->assertStatus(201);

        $messageData = $response->json('data');
        $this->assertNotNull($messageData['metadata']);
        $imagePath = $messageData['metadata']['image_path'];
        $imageUrl = $messageData['metadata']['image_url'];

        $this->assertStringStartsWith('chat_images/', $imagePath);
        $this->assertNotEmpty($imageUrl);

        // Assert file exists on local disk and NOT on public disk
        Storage::disk('local')->assertExists($imagePath);
        Storage::disk('public')->assertMissing($imagePath);

        // Assert pharmacist can view via signed URL
        $streamResponse = $this->get($imageUrl);
        $streamResponse->assertStatus(200);
    }
}
