<?php

namespace Tests\Feature\Order;

use App\Enums\OrderStatus;
use App\Enums\PrescriptionStatus;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemPrescription;
use App\Models\Pharmacist;
use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use App\Models\Products;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PharmacistOutPendingOrderTest extends TestCase
{
    use RefreshDatabase;

    private Pharmacy $pharmacy;
    private User $pharmacistUser;
    private User $customerUser;
    private Customer $customer;
    private PharmacyProduct $rxPharmacyProduct;

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

        Pharmacist::create([
            'user_id'         => $this->pharmacistUser->id,
            'employee_number' => 'EMP-101',
            'license_number'  => 'LIC-101',
        ]);

        $this->customerUser = User::factory()->create([
            'role'        => 'customer',
            'pharmacy_id' => null,
        ]);

        $this->customer = Customer::create([
            'user_id'     => $this->customerUser->id,
            'pharmacy_id' => null,
        ]);

        $category = Category::create([
            'category_name' => 'General Medicine',
            'slug'          => 'general-medicine',
            'is_active'     => true,
        ]);

        $rxProduct = Products::create([
            'product_name'  => 'Amoxicillin 500mg',
            'generic_name'  => 'Amoxicillin',
            'is_prescribed' => true,
        ]);

        $this->rxPharmacyProduct = PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $rxProduct->id,
            'category_id'   => $category->id,
            'stock'         => 50,
            'selling_price' => 100.00,
            'unit_cost'     => 50.00,
            'is_available'  => true,
        ]);
    }

    public function test_pharmacist_can_out_pending_order_marked_as_on_hold(): void
    {
        Notification::fake();

        $order = Order::create([
            'order_number'        => 'ORD-HOLD-001',
            'pharmacy_id'         => $this->pharmacy->id,
            'customer_id'         => $this->customer->id,
            'status'              => OrderStatus::STAND_BY,
            'payment_method'      => 'cash',
            'payment_status'      => 'unpaid',
            'subtotal'            => 100.00,
            'total_amount'        => 100.00,
            'cancellation_reason' => 'Waiting for Stock Arrival',
        ]);

        $item = OrderItem::create([
            'order_id'            => $order->id,
            'pharmacy_product_id' => $this->rxPharmacyProduct->id,
            'product_name'        => 'Amoxicillin 500mg',
            'quantity'            => 1,
            'unit_price_snapshot' => 100.00,
            'line_total'          => 100.00,
        ]);

        OrderItemPrescription::create([
            'order_item_id'           => $item->id,
            'prescription_image_path' => 'prescriptions/rx1.jpg',
            'status'                  => PrescriptionStatus::PENDING,
        ]);

        Sanctum::actingAs($this->pharmacistUser, ['pharmacist']);

        $response = $this->patchJson("/api/pharmacist/orders/{$order->id}/status", [
            'action' => 'out_pending',
        ]);

        $response->assertStatus(200);
        $order->refresh();
        $this->assertEquals(OrderStatus::REVIEWING, $order->status);
    }

    public function test_pharmacist_cannot_out_pending_rejected_order(): void
    {
        Notification::fake();

        $order = Order::create([
            'order_number'        => 'ORD-REJ-001',
            'pharmacy_id'         => $this->pharmacy->id,
            'customer_id'         => $this->customer->id,
            'status'              => OrderStatus::CANCELLED,
            'payment_method'      => 'cash',
            'payment_status'      => 'unpaid',
            'subtotal'            => 100.00,
            'total_amount'        => 100.00,
            'cancelled_at'        => now(),
            'cancellation_reason' => 'Rejected by pharmacist: Product Out of Stock',
        ]);

        Sanctum::actingAs($this->pharmacistUser, ['pharmacist']);

        $response = $this->patchJson("/api/pharmacist/orders/{$order->id}/status", [
            'action' => 'out_pending',
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'status'  => 'error',
            'message' => 'Rejected orders cannot be moved out of pending. Only orders marked as on hold can be moved out of pending.',
        ]);
        $order->refresh();
        $this->assertEquals(OrderStatus::CANCELLED, $order->status);
    }

    public function test_pharmacist_cannot_out_pending_prescription_rejected_order(): void
    {
        Notification::fake();

        $order = Order::create([
            'order_number'        => 'ORD-RX-REJ-001',
            'pharmacy_id'         => $this->pharmacy->id,
            'customer_id'         => $this->customer->id,
            'status'              => OrderStatus::STAND_BY,
            'payment_method'      => 'cash',
            'payment_status'      => 'unpaid',
            'subtotal'            => 100.00,
            'total_amount'        => 100.00,
            'cancellation_reason' => 'Prescription rejected: Fake or Expired Prescription',
        ]);

        $item = OrderItem::create([
            'order_id'            => $order->id,
            'pharmacy_product_id' => $this->rxPharmacyProduct->id,
            'product_name'        => 'Amoxicillin 500mg',
            'quantity'            => 1,
            'unit_price_snapshot' => 100.00,
            'line_total'          => 100.00,
        ]);

        OrderItemPrescription::create([
            'order_item_id'           => $item->id,
            'prescription_image_path' => 'prescriptions/rx1.jpg',
            'status'                  => PrescriptionStatus::REJECTED,
            'rejection_reason'        => 'Fake or Expired Prescription',
        ]);

        Sanctum::actingAs($this->pharmacistUser, ['pharmacist']);

        $response = $this->patchJson("/api/pharmacist/orders/{$order->id}/status", [
            'action' => 'out_pending',
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'status'  => 'error',
            'message' => 'Rejected orders cannot be moved out of pending. Only orders marked as on hold can be moved out of pending.',
        ]);
        $order->refresh();
        $this->assertEquals(OrderStatus::STAND_BY, $order->status);
    }

    public function test_pharmacist_cannot_out_pending_new_pending_order_not_on_hold(): void
    {
        Notification::fake();

        $order = Order::create([
            'order_number'   => 'ORD-PEND-001',
            'pharmacy_id'    => $this->pharmacy->id,
            'customer_id'    => $this->customer->id,
            'status'         => OrderStatus::PENDING,
            'payment_method' => 'cash',
            'payment_status' => 'unpaid',
            'subtotal'       => 100.00,
            'total_amount'   => 100.00,
        ]);

        Sanctum::actingAs($this->pharmacistUser, ['pharmacist']);

        $response = $this->patchJson("/api/pharmacist/orders/{$order->id}/status", [
            'action' => 'out_pending',
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'status'  => 'error',
            'message' => 'This order cannot be updated to the requested status.',
        ]);
        $order->refresh();
        $this->assertEquals(OrderStatus::PENDING, $order->status);
    }
}
