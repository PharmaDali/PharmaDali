<?php

namespace Tests\Feature\Order;

use App\Enums\OrderStatus;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemPrescription;
use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use App\Models\Products;
use App\Models\User;
use App\Notifications\CustomerAcknowledgedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerRemoveRxItemsTest extends TestCase
{
    use RefreshDatabase;

    private Pharmacy $pharmacy;
    private User $pharmacistUser;
    private User $customerUser;
    private Customer $customer;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

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

        $this->category = Category::create([
            'category_name' => 'General Medicine',
            'slug'          => 'general-medicine',
            'is_active'     => true,
        ]);
    }

    public function test_customer_can_remove_rx_items_from_mixed_order_on_hold(): void
    {
        Notification::fake();

        // 1 Rx product and 1 OTC product
        $rxProduct = Products::create([
            'product_name'  => 'Amoxicillin 500mg',
            'generic_name'  => 'Amoxicillin',
            'is_prescribed' => true,
        ]);

        $otcProduct = Products::create([
            'product_name'  => 'Paracetamol 500mg',
            'generic_name'  => 'Paracetamol',
            'is_prescribed' => false,
        ]);

        $rxPharmacyProduct = PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $rxProduct->id,
            'category_id'   => $this->category->id,
            'stock'         => 100,
            'selling_price' => 100.00,
            'unit_cost'     => 50.00,
            'is_available'  => true,
        ]);

        $otcPharmacyProduct = PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $otcProduct->id,
            'category_id'   => $this->category->id,
            'stock'         => 100,
            'selling_price' => 100.00,
            'unit_cost'     => 50.00,
            'is_available'  => true,
        ]);

        $order = Order::create([
            'order_number'        => 'ORD-MIXED-001',
            'pharmacy_id'         => $this->pharmacy->id,
            'customer_id'         => $this->customer->id,
            'status'              => OrderStatus::STAND_BY,
            'payment_method'      => 'gcash',
            'payment_status'      => 'unpaid',
            'subtotal'            => 300.00,
            'discount_percentage' => 10.00,
            'discount_amount'     => 30.00,
            'total_amount'        => 270.00,
            'cancellation_reason' => 'Prescription image is blurry',
        ]);

        $rxItem = OrderItem::create([
            'order_id'            => $order->id,
            'pharmacy_product_id' => $rxPharmacyProduct->id,
            'product_name'        => 'Amoxicillin 500mg',
            'quantity'            => 2,
            'unit_price_snapshot' => 100.00,
            'line_total'          => 200.00,
        ]);

        $rxPrescription = OrderItemPrescription::create([
            'order_item_id'           => $rxItem->id,
            'prescription_image_path' => 'prescriptions/rx1.jpg',
            'status'                  => 'rejected',
            'rejection_reason'        => 'Blurry image',
        ]);

        $otcItem = OrderItem::create([
            'order_id'            => $order->id,
            'pharmacy_product_id' => $otcPharmacyProduct->id,
            'product_name'        => 'Paracetamol 500mg',
            'quantity'            => 1,
            'unit_price_snapshot' => 100.00,
            'line_total'          => 100.00,
        ]);

        Sanctum::actingAs($this->customerUser, ['customer']);

        $response = $this->postJson("/api/customer/orders/{$order->id}/remove-rx-items");

        $response->assertStatus(200);
        $response->assertJson([
            'status'  => 'success',
            'message' => 'Prescription items removed. Order will proceed with remaining items.',
        ]);

        // Assert prescription item and prescription records are deleted
        $this->assertDatabaseMissing('order_items', ['id' => $rxItem->id]);
        $this->assertDatabaseMissing('order_item_prescriptions', ['id' => $rxPrescription->id]);

        // Assert OTC item remains
        $this->assertDatabaseHas('order_items', ['id' => $otcItem->id]);

        // Assert updated order attributes
        $order->refresh();
        $this->assertEquals(OrderStatus::REVIEWING, $order->status);
        $this->assertNull($order->cancellation_reason);
        $this->assertEquals(100.00, (float) $order->subtotal);
        $this->assertEquals(10.00, (float) $order->discount_amount);
        $this->assertEquals(90.00, (float) $order->total_amount);

        // Assert notification dispatched to pharmacist
        Notification::assertSentTo(
            $this->pharmacistUser,
            CustomerAcknowledgedNotification::class,
            function ($notification) use ($order) {
                $array = $notification->toArray($this->pharmacistUser);
                return $array['order_id'] === $order->id
                    && $array['issue_type'] === 'Prescription'
                    && str_contains($array['message'], 'removed prescription items');
            }
        );
    }

    public function test_customer_cannot_remove_rx_items_if_order_not_in_stand_by(): void
    {
        $rxProduct = Products::create([
            'product_name'  => 'Amoxicillin 500mg',
            'is_prescribed' => true,
        ]);

        $rxPharmacyProduct = PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $rxProduct->id,
            'category_id'   => $this->category->id,
            'stock'         => 100,
            'selling_price' => 100.00,
            'unit_cost'     => 50.00,
            'is_available'  => true,
        ]);

        $order = Order::create([
            'order_number'   => 'ORD-PENDING-001',
            'pharmacy_id'    => $this->pharmacy->id,
            'customer_id'    => $this->customer->id,
            'status'         => OrderStatus::PENDING,
            'payment_method' => 'cash',
            'payment_status' => 'unpaid',
            'subtotal'       => 100.00,
            'total_amount'   => 100.00,
        ]);

        OrderItem::create([
            'order_id'            => $order->id,
            'pharmacy_product_id' => $rxPharmacyProduct->id,
            'product_name'        => 'Amoxicillin 500mg',
            'quantity'            => 1,
            'unit_price_snapshot' => 100.00,
            'line_total'          => 100.00,
        ]);

        Sanctum::actingAs($this->customerUser, ['customer']);

        $response = $this->postJson("/api/customer/orders/{$order->id}/remove-rx-items");

        $response->assertStatus(422);
        $response->assertJson([
            'status'  => 'error',
            'message' => 'Order is not in stand_by status.',
        ]);
    }

    public function test_unauthorized_customer_cannot_remove_rx_items(): void
    {
        $otherCustomerUser = User::factory()->create(['role' => 'customer']);
        Customer::create([
            'user_id'     => $otherCustomerUser->id,
            'pharmacy_id' => null,
        ]);

        $order = Order::create([
            'order_number'   => 'ORD-OTHER-001',
            'pharmacy_id'    => $this->pharmacy->id,
            'customer_id'    => $this->customer->id,
            'status'         => OrderStatus::STAND_BY,
            'payment_method' => 'cash',
            'payment_status' => 'unpaid',
            'subtotal'       => 100.00,
            'total_amount'   => 100.00,
        ]);

        Sanctum::actingAs($otherCustomerUser, ['customer']);

        $response = $this->postJson("/api/customer/orders/{$order->id}/remove-rx-items");

        $response->assertStatus(403);
    }

    public function test_removing_rx_items_when_no_items_remain_cancels_order(): void
    {
        $rxProduct = Products::create([
            'product_name'  => 'Amoxicillin 500mg',
            'is_prescribed' => true,
        ]);

        $rxPharmacyProduct = PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $rxProduct->id,
            'category_id'   => $this->category->id,
            'stock'         => 100,
            'selling_price' => 100.00,
            'unit_cost'     => 50.00,
            'is_available'  => true,
        ]);

        $order = Order::create([
            'order_number'   => 'ORD-RX-ONLY-001',
            'pharmacy_id'    => $this->pharmacy->id,
            'customer_id'    => $this->customer->id,
            'status'         => OrderStatus::STAND_BY,
            'payment_method' => 'cash',
            'payment_status' => 'unpaid',
            'subtotal'       => 100.00,
            'total_amount'   => 100.00,
        ]);

        OrderItem::create([
            'order_id'            => $order->id,
            'pharmacy_product_id' => $rxPharmacyProduct->id,
            'product_name'        => 'Amoxicillin 500mg',
            'quantity'            => 1,
            'unit_price_snapshot' => 100.00,
            'line_total'          => 100.00,
        ]);

        Sanctum::actingAs($this->customerUser, ['customer']);

        $response = $this->postJson("/api/customer/orders/{$order->id}/remove-rx-items");

        $response->assertStatus(200);
        $order->refresh();
        $this->assertEquals(OrderStatus::CANCELLED, $order->status);
        $this->assertNotNull($order->cancelled_at);
        $this->assertStringContainsString('All prescription items were removed', $order->cancellation_reason);
    }
}

