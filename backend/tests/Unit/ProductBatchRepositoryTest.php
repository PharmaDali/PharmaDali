<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\PharmacyProduct;
use App\Models\ProductBatch;
use App\Repositories\ProductBatchRepository;
use Carbon\Carbon;
use Database\Seeders\TestSeeder; // Assuming a seeder or we can just use factories

class ProductBatchRepositoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_pharmacy_product_stock_handles_expired_and_unavailable()
    {
        $pharmacy = \App\Models\Pharmacy::create([
            'pharmacy_name' => 'Test Pharmacy',
            'location' => 'Test Location',
            'contact_number' => '1234567890',
            'email' => 'test@example.com',
            'business_permit_number' => 'BP123',
            'status' => 'active',
            'fefo_enabled' => true,
        ]);
        $product = \App\Models\Products::create([
            'product_name' => 'Test Product',
            'product_type' => 'Medicine',
            'generic_name' => 'Test Generic',
            'brand_name' => 'Test Brand',
            'image_path' => null,
            'is_prescribed' => false,
        ]);
        $category = \App\Models\Category::create([
            'category_name' => 'Test Category'
        ]);

        $pharmacyProduct = PharmacyProduct::factory()->create([
            'pharmacy_id' => $pharmacy->id,
            'product_id' => $product->id,
            'category_id' => $category->id,
            'stock' => 0,
            'is_available' => true,
            'is_expired' => false,
        ]);

        $repo = new ProductBatchRepository();

        // 1. Add an expired batch
        ProductBatch::create([
            'pharmacy_product_id' => $pharmacyProduct->id,
            'batch_number' => 'B001',
            'stock' => 10,
            'expiry_date' => Carbon::yesterday(),
            'received_at' => Carbon::now(),
        ]);

        $repo->syncPharmacyProductStock($pharmacyProduct->id);
        $pharmacyProduct->refresh();

        // Stock should be 10, but it should be marked expired and unavailable
        $this->assertEquals(10, $pharmacyProduct->stock);
        $this->assertFalse((bool)$pharmacyProduct->is_available);
        $this->assertTrue((bool)$pharmacyProduct->is_expired);

        // 2. Add a valid batch
        ProductBatch::create([
            'pharmacy_product_id' => $pharmacyProduct->id,
            'batch_number' => 'B002',
            'stock' => 5,
            'expiry_date' => Carbon::tomorrow(),
            'received_at' => Carbon::now(),
        ]);

        $repo->syncPharmacyProductStock($pharmacyProduct->id);
        $pharmacyProduct->refresh();

        // Stock should be 15, should NOT be marked expired
        $this->assertEquals(15, $pharmacyProduct->stock);
        $this->assertFalse((bool)$pharmacyProduct->is_expired);
        // Note: we don't automatically set is_available back to true, 
        // to not overwrite admin overrides. If it was false, it remains false unless admin changes it, 
        // OR wait, my code only sets it to false if sellableStock <= 0. It does NOT set it to true.
    }
}
