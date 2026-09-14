<?php

namespace Tests\Feature\Order;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemPrescription;
use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use App\Models\Products;
use App\Models\User;
use App\Notifications\DiscountIdVerifiedNotification;
use App\Notifications\OrderStatusNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerPrescriptionAndDiscountOnlinePaymentTest extends TestCase
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

        \App\Models\Pharmacist::create([
            'user_id'         => $this->pharmacistUser->id,
            'employee_number' => 'EMP-001',
            'license_number'  => 'LIC-001',
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

    public function test_order_with_prescription_and_discount_id_transitions_to_awaiting_payment_after_both_are_approved(): void
    {
        Notification::fake();

        $rxProduct = Products::create([
            'product_name'  => 'Amoxicillin 500mg',
            'generic_name'  => 'Amoxicillin',
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
            'order_number'           => 'ORD-RX-DISC-001',
            'pharmacy_id'            => $this->pharmacy->id,
            'customer_id'            => $this->customer->id,
            'status'                 => OrderStatus::REVIEWING,
            'payment_method'         => 'gcash',
            'payment_status'         => PaymentStatus::UNPAID,
            'subtotal'               => 200.00,
            'discount_type'          => 'senior_citizen',
            'discount_percentage'    => 20.00,
            'discount_amount'        => 40.00,
            'total_amount'           => 160.00,
            'discount_id_image_path' => 'discounts/id.jpg',
            'discount_remarks'       => null,
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
            'status'                  => 'pending',
        ]);

        // Step 1: Pharmacist approves discount ID section
        Sanctum::actingAs($this->pharmacistUser, ['pharmacist']);

        $responseDiscount = $this->patchJson("/api/pharmacist/orders/{$order->id}/status", [
            'action'  => 'approve',
            'section' => 'discount',
        ]);

        $responseDiscount->assertStatus(200);
        $order->refresh();

        // Discount is approved, but order should NOT be awaiting_payment yet because prescription is pending
        $this->assertEquals('approved', $order->discount_remarks);
        $this->assertEquals(OrderStatus::REVIEWING, $order->status);

        // Step 2: Pharmacist approves overall order (including prescription)
        $responseOrder = $this->patchJson("/api/pharmacist/orders/{$order->id}/status", [
            'action' => 'approve',
        ]);

        $responseOrder->assertStatus(200);
        $order->refresh();

        // Now that both discount and prescription are approved, status MUST be awaiting_payment
        $this->assertEquals(OrderStatus::AWAITING_PAYMENT, $order->status);
        $rxPrescription->refresh();
        $this->assertEquals(\App\Enums\PrescriptionStatus::VERIFIED, $rxPrescription->status);
    }

    public function test_mixed_order_with_prescription_removed_transitions_to_awaiting_payment_after_approval(): void
    {
        Notification::fake();

        $rxProduct = Products::create([
            'product_name'  => 'Amoxicillin 500mg',
            'is_prescribed' => true,
        ]);

        $otcProduct = Products::create([
            'product_name'  => 'Paracetamol 500mg',
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

        // Order placed on hold due to prescription rejection
        $order = Order::create([
            'order_number'           => 'ORD-MIXED-HOLD-001',
            'pharmacy_id'            => $this->pharmacy->id,
            'customer_id'            => $this->customer->id,
            'status'                 => OrderStatus::STAND_BY,
            'payment_method'         => 'gcash',
            'payment_status'         => PaymentStatus::UNPAID,
            'subtotal'               => 200.00,
            'discount_type'          => 'senior_citizen',
            'discount_percentage'    => 20.00,
            'discount_amount'        => 40.00,
            'total_amount'           => 160.00,
            'discount_id_image_path' => 'discounts/id.jpg',
            'discount_remarks'       => 'approved',
            'cancellation_reason'    => 'Prescription invalid',
        ]);

        $rxItem = OrderItem::create([
            'order_id'            => $order->id,
            'pharmacy_product_id' => $rxPharmacyProduct->id,
            'product_name'        => 'Amoxicillin 500mg',
            'quantity'            => 1,
            'unit_price_snapshot' => 100.00,
            'line_total'          => 100.00,
        ]);

        OrderItemPrescription::create([
            'order_item_id'           => $rxItem->id,
            'prescription_image_path' => 'prescriptions/rx1.jpg',
            'status'                  => 'rejected',
        ]);

        $otcItem = OrderItem::create([
            'order_id'            => $order->id,
            'pharmacy_product_id' => $otcPharmacyProduct->id,
            'product_name'        => 'Paracetamol 500mg',
            'quantity'            => 1,
            'unit_price_snapshot' => 100.00,
            'line_total'          => 100.00,
        ]);

        // Customer chooses to proceed with OTC items only
        Sanctum::actingAs($this->customerUser, ['customer']);
        $removeResponse = $this->postJson("/api/customer/orders/{$order->id}/remove-rx-items");
        $removeResponse->assertStatus(200);

        $order->refresh();
        $this->assertEquals(OrderStatus::REVIEWING, $order->status);
        $this->assertEquals(100.00, (float) $order->subtotal);
        $this->assertEquals(20.00, (float) $order->discount_amount);
        $this->assertEquals(80.00, (float) $order->total_amount);

        // Pharmacist now approves the updated OTC order
        Sanctum::actingAs($this->pharmacistUser, ['pharmacist']);
        $approveResponse = $this->patchJson("/api/pharmacist/orders/{$order->id}/status", [
            'action' => 'approve',
        ]);
        $approveResponse->assertStatus(200);

        $order->refresh();
        // Since discount is approved, prescription is removed, and payment is GCash unpaid, status goes to awaiting_payment
        $this->assertEquals(OrderStatus::AWAITING_PAYMENT, $order->status);
    }
}
