<?php

namespace Tests\Feature\Pos;

use App\Models\Category;
use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use App\Models\ProductBatch;
use App\Models\Products;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PosDiscountTest extends TestCase
{
    use RefreshDatabase;

    private Pharmacy $pharmacy;
    private User $pharmacist;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pharmacy = Pharmacy::create([
            'pharmacy_name'  => 'Dali Test Pharmacy',
            'location'       => 'City Center',
            'contact_number' => '09123456789',
            'is_active'      => true,
            'vat_type'       => 'non_vat',
        ]);

        $this->pharmacist = User::factory()->create([
            'role'        => 'pharmacist',
            'pharmacy_id' => $this->pharmacy->id,
        ]);

        \App\Models\Pharmacist::create([
            'user_id'         => $this->pharmacist->id,
            'employee_number' => 'EMP-123',
            'permissions'     => ['access_pos'],
        ]);

        $this->category = Category::create(['category_name' => 'General']);
    }

    public function test_pos_order_applies_discount_only_to_discountable_products(): void
    {
        Sanctum::actingAs($this->pharmacist, ['pharmacist']);

        // 1. Discountable product: PHP 100
        $product1 = Products::create([
            'pharmacy_id'  => $this->pharmacy->id,
            'product_name' => 'Discountable Med',
            'product_type' => 'medicine',
        ]);
        $pp1 = PharmacyProduct::create([
            'pharmacy_id'     => $this->pharmacy->id,
            'product_id'      => $product1->id,
            'category_id'     => $this->category->id,
            'stock'           => 10,
            'selling_price'   => 100.00,
            'is_discountable' => true,
            'is_available'    => true,
        ]);
        ProductBatch::create([
            'pharmacy_product_id' => $pp1->id,
            'batch_number'        => 'BATCH-1',
            'stock'               => 10,
            'expiry_date'         => Carbon::now()->addYear(),
        ]);

        // 2. Non-discountable product: PHP 100
        $product2 = Products::create([
            'pharmacy_id'  => $this->pharmacy->id,
            'product_name' => 'Non-discountable Item',
            'product_type' => 'supply',
        ]);
        $pp2 = PharmacyProduct::create([
            'pharmacy_id'     => $this->pharmacy->id,
            'product_id'      => $product2->id,
            'category_id'     => $this->category->id,
            'stock'           => 10,
            'selling_price'   => 100.00,
            'is_discountable' => false,
            'is_available'    => true,
        ]);
        ProductBatch::create([
            'pharmacy_product_id' => $pp2->id,
            'batch_number'        => 'BATCH-2',
            'stock'               => 10,
            'expiry_date'         => Carbon::now()->addYear(),
        ]);

        // Place POS order with 20% discount on both items
        $response = $this->postJson('/api/pos/orders', [
            'items' => [
                ['id' => $pp1->id, 'qty' => 1],
                ['id' => $pp2->id, 'qty' => 1],
            ],
            'payment_method'      => 'cash',
            'discount_type'       => 'senior',
            'discount_percentage' => 20,
            'discount_id_number'  => 'OSCA-12345',
            'amount_received'     => 200,
        ]);

        $response->assertStatus(201);
        $order = $response->json('data');

        // Subtotal = 200 (100 + 100)
        $this->assertEquals(200.00, (float) $order['subtotal']);
        // Discount should only apply to pp1 (20% of 100 = 20)
        $this->assertEquals(20.00, (float) $order['discount_amount']);
        // Total should be 180 (200 - 20)
        $this->assertEquals(180.00, (float) $order['total_amount']);
        $this->assertEquals(20.00, (float) $order['change_amount']);
    }

    public function test_pos_order_alone_not_discountable_has_zero_discount(): void
    {
        Sanctum::actingAs($this->pharmacist, ['pharmacist']);

        // Non-discountable product: PHP 150
        $product = Products::create([
            'pharmacy_id'  => $this->pharmacy->id,
            'product_name' => 'Non-discountable Item',
            'product_type' => 'supply',
        ]);
        $pp = PharmacyProduct::create([
            'pharmacy_id'     => $this->pharmacy->id,
            'product_id'      => $product->id,
            'category_id'     => $this->category->id,
            'stock'           => 5,
            'selling_price'   => 150.00,
            'is_discountable' => false,
            'is_available'    => true,
        ]);
        ProductBatch::create([
            'pharmacy_product_id' => $pp->id,
            'batch_number'        => 'BATCH-3',
            'stock'               => 5,
            'expiry_date'         => Carbon::now()->addYear(),
        ]);

        // Place order attempting discount on non-discountable item
        $response = $this->postJson('/api/pos/orders', [
            'items' => [
                ['id' => $pp->id, 'qty' => 1],
            ],
            'payment_method'      => 'cash',
            'discount_type'       => 'pwd',
            'discount_percentage' => 20,
            'discount_id_number'  => 'PWD-999',
            'amount_received'     => 150,
        ]);

        $response->assertStatus(201);
        $order = $response->json('data');

        // Discount must be 0 and discount_type none
        $this->assertEquals(150.00, (float) $order['subtotal']);
        $this->assertEquals(0.00, (float) $order['discount_amount']);
        $this->assertEquals(150.00, (float) $order['total_amount']);
        $this->assertEquals('none', $order['discount_type']);
        $this->assertNull($order['discount_id_number']);
    }
}
