<?php

namespace Tests\Feature\Inventory;

use App\Models\Category;
use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use App\Models\Products;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InventoryStatusAndPrescriptionTest extends TestCase
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

    public function test_can_update_product_needs_prescription_flag(): void
    {
        Sanctum::actingAs($this->adminUser, ['pharmacy_admin']);

        $category = Category::create(['category_name' => 'Antibiotics']);
        $product = Products::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_type'  => 'medicine',
            'product_name'  => 'Amoxicillin 500mg',
            'generic_name'  => 'Amoxicillin',
            'brand_name'    => 'Amoxil',
            'form'          => 'Capsule',
            'strength'      => '500mg',
            'is_prescribed' => false,
        ]);

        $pharmacyProduct = PharmacyProduct::create([
            'pharmacy_id'     => $this->pharmacy->id,
            'product_id'      => $product->id,
            'category_id'     => $category->id,
            'stock'           => 100,
            'selling_price'   => 15.00,
            'is_discountable' => true,
            'is_available'    => true,
        ]);

        // Toggle is_prescribed to true
        $response = $this->putJson("/api/products/{$product->id}", [
            'product_type'  => 'medicine',
            'product_name'  => 'Amoxicillin 500mg',
            'generic_name'  => 'Amoxicillin',
            'brand_name'    => 'Amoxil',
            'form'          => 'Capsule',
            'strength'      => '500mg',
            'selling_price' => 15.00,
            'is_prescribed' => true,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('products', [
            'id'            => $product->id,
            'is_prescribed' => 1,
        ]);

        // Verify inventory list returns is_prescribed = true
        $listResponse = $this->getJson('/api/pharmacy/inventory/products');
        $listResponse->assertStatus(200);
        $found = collect($listResponse->json('data'))->firstWhere('product_id', $product->id);
        $this->assertNotNull($found);
        $this->assertTrue($found['is_prescribed']);
    }

    public function test_inventory_returns_no_stocks_status_for_zero_stock_items(): void
    {
        Sanctum::actingAs($this->adminUser, ['pharmacy_admin']);

        $category = Category::create(['category_name' => 'Supplements']);
        
        // Zero stock product
        $outOfStockProduct = Products::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_type'  => 'medicine',
            'product_name'  => 'Vitamin C 500mg',
            'is_prescribed' => false,
        ]);
        PharmacyProduct::create([
            'pharmacy_id'     => $this->pharmacy->id,
            'product_id'      => $outOfStockProduct->id,
            'category_id'     => $category->id,
            'stock'           => 0,
            'selling_price'   => 5.00,
            'is_discountable' => true,
            'is_available'    => true,
        ]);

        // Low stock product (stock = 15)
        $lowStockProduct = Products::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_type'  => 'medicine',
            'product_name'  => 'Vitamin D 1000IU',
            'is_prescribed' => false,
        ]);
        PharmacyProduct::create([
            'pharmacy_id'     => $this->pharmacy->id,
            'product_id'      => $lowStockProduct->id,
            'category_id'     => $category->id,
            'stock'           => 15,
            'selling_price'   => 10.00,
            'is_discountable' => true,
            'is_available'    => true,
        ]);

        // Fetch all inventory products
        $response = $this->getJson('/api/pharmacy/inventory/products');
        $response->assertStatus(200);

        $items = collect($response->json('data'));
        $outItem = $items->firstWhere('product_id', $outOfStockProduct->id);
        $lowItem = $items->firstWhere('product_id', $lowStockProduct->id);

        $this->assertEquals('No Stocks', $outItem['status']);
        $this->assertEquals('Low Stocks', $lowItem['status']);

        // Test filtering by "No Stocks"
        $filterNoStockResponse = $this->getJson('/api/pharmacy/inventory/products?status=No+Stocks');
        $filterNoStockResponse->assertStatus(200);
        $filteredNoStock = collect($filterNoStockResponse->json('data'));
        $this->assertTrue($filteredNoStock->contains('product_id', $outOfStockProduct->id));
        $this->assertFalse($filteredNoStock->contains('product_id', $lowStockProduct->id));

        // Test filtering by "Low Stocks"
        $filterLowStockResponse = $this->getJson('/api/pharmacy/inventory/products?status=Low+Stocks');
        $filterLowStockResponse->assertStatus(200);
        $filteredLowStock = collect($filterLowStockResponse->json('data'));
        $this->assertFalse($filteredLowStock->contains('product_id', $outOfStockProduct->id));
        $this->assertTrue($filteredLowStock->contains('product_id', $lowStockProduct->id));
    }
}
