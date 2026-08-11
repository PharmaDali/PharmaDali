<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use App\Models\Products;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ItemExchangeTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Pharmacy $pharmacy;
    private PharmacyProduct $product1;
    private PharmacyProduct $product2;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pharmacy = Pharmacy::create([
            'pharmacy_name' => 'Test Pharmacy',
            'location' => 'Main Street',
            'contact_number' => '09123456789',
            'is_active' => true,
            'item_exchange_window_days' => 1,
            'allow_item_exchange' => true,
        ]);

        $this->user = User::factory()->create([
            'pharmacy_id' => $this->pharmacy->id,
            'role' => 'pharmacy_admin',
        ]);

        $cat = Category::create(['category_name' => 'General']);

        $p1 = Products::create([
            'product_name' => 'Paracetamol 500mg',
            'generic_name' => 'Paracetamol',
            'brand_name' => 'Biogesic',
            'price' => 10.00,
        ]);

        $p2 = Products::create([
            'product_name' => 'Amoxicillin 500mg',
            'generic_name' => 'Amoxicillin',
            'brand_name' => 'Amoxil',
            'price' => 25.00,
        ]);

        $this->product1 = PharmacyProduct::create([
            'pharmacy_id' => $this->pharmacy->id,
            'product_id' => $p1->id,
            'category_id' => $cat->id,
            'stock' => 50,
            'selling_price' => 10.00,
            'is_available' => true,
        ]);

        $this->product2 = PharmacyProduct::create([
            'pharmacy_id' => $this->pharmacy->id,
            'product_id' => $p2->id,
            'category_id' => $cat->id,
            'stock' => 30,
            'selling_price' => 25.00,
            'is_available' => true,
        ]);

        // Create completed order
        $this->order = Order::create([
            'order_number' => 'POS-TEST001',
            'pharmacy_id' => $this->pharmacy->id,
            'status' => 'completed',
            'verified_by' => $this->user->id,
            'verified_at' => now(),
            'payment_method' => 'cash',
            'payment_status' => 'paid',
            'subtotal' => 50.00,
            'total_amount' => 50.00,
            'amount_received' => 50.00,
            'change_amount' => 0.00,
            'completed_at' => now(),
        ]);

        OrderItem::create([
            'order_id' => $this->order->id,
            'pharmacy_product_id' => $this->product1->id,
            'quantity' => 5,
            'unit_price_snapshot' => 10.00,
            'line_total' => 50.00,
            'product_name' => 'Paracetamol 500mg',
        ]);
    }

    public function test_can_fetch_order_exchange_eligibility(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/pos/orders/{$this->order->id}/exchange-eligibility");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.eligible', true);
    }

    public function test_can_fetch_eligibility_by_order_number_string(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson("/api/pos/orders/{$this->order->order_number}/exchange-eligibility");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.eligible', true);
    }

    public function test_respects_pharmacy_operating_hours_for_exchange(): void
    {
        $this->pharmacy->update([
            'opening_hour' => '09:00:00',
            'closing_hour' => '17:00:00',
            'item_exchange_window_days' => 1,
        ]);

        $this->travelTo(now('Asia/Manila')->setTime(20, 0, 0));

        $response = $this->actingAs($this->user)
            ->getJson("/api/pos/orders/{$this->order->id}/exchange-eligibility");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.eligible', false);
    }

    public function test_equal_exchange_balances_zero(): void
    {
        $orderItem = $this->order->items->first();

        // Exchange 5 units of product1 (₱50) for 2 units of product2 (₱50)
        $payload = [
            'order_id' => $this->order->id,
            'returned_items' => [
                [
                    'order_item_id' => $orderItem->id,
                    'quantity' => 5,
                    'condition' => 'resalable',
                ],
            ],
            'replacement_items' => [
                [
                    'pharmacy_product_id' => $this->product2->id,
                    'quantity' => 2,
                ],
            ],
            'payment_method' => 'cash',
            'amount_received' => 0,
            'reason' => 'Defective packaging',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/pos/exchanges', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_returned_value', '50.00')
            ->assertJsonPath('data.total_replacement_value', '50.00')
            ->assertJsonPath('data.additional_payment', '0.00')
            ->assertJsonPath('data.change_amount', '0.00');

        // Stock check
        $this->assertEquals(55, $this->product1->fresh()->stock); // 50 + 5 returned
        $this->assertEquals(28, $this->product2->fresh()->stock); // 30 - 2 replacement
    }

    public function test_enforces_no_cash_refund_when_replacement_is_lower_value(): void
    {
        $orderItem = $this->order->items->first();

        // Return 5 units of product1 (₱50) and pick 1 unit of product2 (₱25)
        $payload = [
            'order_id' => $this->order->id,
            'returned_items' => [
                [
                    'order_item_id' => $orderItem->id,
                    'quantity' => 5,
                    'condition' => 'resalable',
                ],
            ],
            'replacement_items' => [
                [
                    'pharmacy_product_id' => $this->product2->id,
                    'quantity' => 1,
                ],
            ],
            'payment_method' => 'cash',
            'amount_received' => 0,
            'reason' => 'Customer preference',
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/pos/exchanges', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.total_returned_value', '50.00')
            ->assertJsonPath('data.total_replacement_value', '25.00')
            ->assertJsonPath('data.additional_payment', '0.00')
            ->assertJsonPath('data.change_amount', '0.00'); // NO CASH REFUND ALLOWED
    }
}
