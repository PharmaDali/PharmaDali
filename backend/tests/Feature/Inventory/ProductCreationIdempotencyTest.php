<?php

namespace Tests\Feature\Inventory;

use App\Models\Category;
use App\Models\Pharmacy;
use App\Models\PharmacyCategory;
use App\Models\PharmacyProduct;
use App\Models\Products;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductCreationIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    private Pharmacy $pharmacy;
    private User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pharmacy = Pharmacy::create([
            'pharmacy_name'  => 'Dali Test Pharmacy',
            'location'       => 'City Center',
            'contact_number' => '09123456789',
            'is_active'      => true,
        ]);

        $this->adminUser = User::factory()->create([
            'role'        => 'pharmacy_admin',
            'pharmacy_id' => $this->pharmacy->id,
        ]);
    }

    public function test_can_create_product_with_category_and_auto_enables_pharmacy_category(): void
    {
        Sanctum::actingAs($this->adminUser, ['pharmacy_admin']);

        $payload = [
            'product_type'   => 'medicine',
            'generic_name'   => 'Paracetamol',
            'brand_name'     => 'Biogesic',
            'product_name'   => 'Paracetamol',
            'form'           => 'Tablet',
            'strength'       => '500mg',
            'category_name'  => 'Vitamins',
            'selling_price'  => 10.50,
            'unit_cost'      => 5.00,
            'stock'          => 50,
            'idempotency_key'=> 'test-key-1',
        ];

        $response = $this->postJson('/api/products', $payload);

        $response->assertStatus(201);
        $this->assertDatabaseHas('products', [
            'generic_name' => 'Paracetamol',
            'brand_name'   => 'Biogesic',
        ]);

        $category = Category::where('category_name', 'Vitamins')->first();
        $this->assertNotNull($category);

        $this->assertDatabaseHas('pharmacy_categories', [
            'pharmacy_id' => $this->pharmacy->id,
            'category_id' => $category->id,
            'is_enabled'  => 1,
        ]);
    }

    public function test_idempotent_duplicate_request_returns_same_product_without_duplicate_row(): void
    {
        Sanctum::actingAs($this->adminUser, ['pharmacy_admin']);

        $payload = [
            'product_type'   => 'medicine',
            'generic_name'   => 'Ibuprofen',
            'brand_name'     => 'Advil',
            'product_name'   => 'Ibuprofen',
            'form'           => 'Softgel',
            'strength'       => '200mg',
            'category_name'  => 'Generic',
            'selling_price'  => 12.00,
            'unit_cost'      => 6.00,
            'stock'          => 20,
            'idempotency_key'=> 'unique-idem-12345',
        ];

        $response1 = $this->postJson('/api/products', $payload, [
            'X-Idempotency-Key' => 'unique-idem-12345'
        ]);
        $response1->assertStatus(201);
        $productId1 = $response1->json('data.id');

        // Replay identical request with same idempotency key
        $response2 = $this->postJson('/api/products', $payload, [
            'X-Idempotency-Key' => 'unique-idem-12345'
        ]);
        $response2->assertStatus(201);
        $productId2 = $response2->json('data.id');

        $this->assertEquals($productId1, $productId2);
        $this->assertEquals(1, Products::where('product_name', 'Ibuprofen')->count());
    }

    public function test_rapid_consecutive_clicks_deduplicated_even_without_idempotency_key(): void
    {
        Sanctum::actingAs($this->adminUser, ['pharmacy_admin']);

        $payload = [
            'product_type'   => 'non_medicine',
            'product_name'   => 'Digital Thermometer',
            'category_name'  => 'Supplies',
            'selling_price'  => 250.00,
            'unit_cost'      => 150.00,
            'stock'          => 10,
        ];

        $response1 = $this->postJson('/api/products', $payload);
        $response1->assertStatus(201);

        $response2 = $this->postJson('/api/products', $payload);
        $response2->assertStatus(201);

        // Deduplication guard must ensure only 1 product record exists
        $this->assertEquals(1, Products::where('product_name', 'Digital Thermometer')->count());
    }

    public function test_can_update_product_category_and_unit_cost(): void
    {
        Sanctum::actingAs($this->adminUser, ['pharmacy_admin']);

        $category = Category::create(['category_name' => 'General']);
        $product = Products::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_type'  => 'medicine',
            'product_name'  => 'Cetirizine',
            'generic_name'  => 'Cetirizine',
            'brand_name'    => 'Alnix',
            'form'          => 'Syrup',
            'strength'      => '5mg/5mL',
            'is_prescribed' => false,
        ]);

        PharmacyProduct::create([
            'pharmacy_id'     => $this->pharmacy->id,
            'product_id'      => $product->id,
            'category_id'     => $category->id,
            'stock'           => 15,
            'selling_price'   => 120.00,
            'unit_cost'       => 80.00,
            'is_discountable' => true,
            'is_available'    => true,
        ]);

        $updatePayload = [
            'product_type'   => 'medicine',
            'product_name'   => 'Cetirizine',
            'generic_name'   => 'Cetirizine',
            'brand_name'     => 'Alnix',
            'category_name'  => 'Sanitary',
            'selling_price'  => 130.00,
            'unit_cost'      => 85.00,
            'is_discountable'=> true,
            'is_available'   => true,
        ];

        $response = $this->putJson("/api/products/{$product->id}", $updatePayload);
        $response->assertStatus(200);

        $pharmacyProduct = PharmacyProduct::where('pharmacy_id', $this->pharmacy->id)
            ->where('product_id', $product->id)
            ->first();

        $this->assertEquals('130.00', $pharmacyProduct->selling_price);
        $this->assertEquals('85.00', $pharmacyProduct->unit_cost);

        $newCategory = Category::where('category_name', 'Sanitary')->first();
        $this->assertNotNull($newCategory);
        $this->assertEquals($newCategory->id, $pharmacyProduct->category_id);
    }

    public function test_product_creation_records_inventory_log_stock_in(): void
    {
        Sanctum::actingAs($this->adminUser, ['pharmacy_admin']);

        $payload = [
            'product_type'   => 'medicine',
            'product_name'   => 'Loperamide',
            'generic_name'   => 'Loperamide',
            'brand_name'     => 'Imodium',
            'form'           => 'Capsule',
            'strength'       => '2mg',
            'category_name'  => 'Generic',
            'selling_price'  => 15.00,
            'unit_cost'      => 8.00,
            'stock'          => 100,
            'batch_number'   => 'BATCH-LOP-01',
        ];

        $response = $this->postJson('/api/products', $payload);
        $response->assertStatus(201);

        $productId = $response->json('data.id');
        $pharmacyProduct = PharmacyProduct::where('pharmacy_id', $this->pharmacy->id)
            ->where('product_id', $productId)
            ->first();

        $this->assertNotNull($pharmacyProduct);

        // Verify inventory log entry was created
        $this->assertDatabaseHas('inventory_logs', [
            'pharmacy_id'         => $this->pharmacy->id,
            'pharmacy_product_id' => $pharmacyProduct->id,
            'transaction_type'    => 'stock_in',
            'quantity'            => 100,
        ]);
    }

    public function test_product_deletion_deletes_associated_batch_stocks_and_pharmacy_product(): void
    {
        Sanctum::actingAs($this->adminUser, ['pharmacy_admin']);

        // Create product with batch stocks
        $payload = [
            'product_type'   => 'medicine',
            'product_name'   => 'Mefenamic Acid',
            'generic_name'   => 'Mefenamic Acid',
            'brand_name'     => 'Ponstan',
            'form'           => 'Capsule',
            'strength'       => '500mg',
            'category_name'  => 'Generic',
            'selling_price'  => 25.00,
            'unit_cost'      => 12.00,
            'stock'          => 60,
            'batch_number'   => 'BATCH-MEF-99',
            'expiry_date'    => '2027-12-31',
        ];

        $createRes = $this->postJson('/api/products', $payload);
        $createRes->assertStatus(201);

        $productId = $createRes->json('data.id');
        $pharmacyProduct = PharmacyProduct::where('pharmacy_id', $this->pharmacy->id)
            ->where('product_id', $productId)
            ->first();

        $this->assertNotNull($pharmacyProduct);
        $this->assertEquals(1, $pharmacyProduct->batches()->count());

        // Execute DELETE /api/products/{id}
        $deleteRes = $this->deleteJson("/api/products/{$productId}");
        $deleteRes->assertStatus(200);

        // Verify product, pharmacy product, and product batches are deleted
        $this->assertDatabaseMissing('products', ['id' => $productId]);
        $this->assertDatabaseMissing('pharmacy_products', ['id' => $pharmacyProduct->id]);
        $this->assertDatabaseMissing('product_batches', ['pharmacy_product_id' => $pharmacyProduct->id]);
    }
}
