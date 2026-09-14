<?php

namespace Tests\Feature\Category;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Pharmacy;
use App\Models\PharmacyCategory;
use App\Models\PharmacyProduct;
use App\Models\Products;
use App\Models\User;
use App\Services\CustomerRecommendationService;
use App\Services\PharmacyProduct\ShowPharmacyCategoriesService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoryBranchToggleAndHeroRecommendationTest extends TestCase
{
    use RefreshDatabase;

    private Pharmacy $pharmacyA;
    private Pharmacy $pharmacyB;
    private User $adminA;
    private User $adminB;
    private User $superAdmin;
    private Category $categoryVitamins;
    private Category $categoryDiapers;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pharmacyA = Pharmacy::create([
            'pharmacy_name'  => 'Branch Alpha',
            'location'       => 'City A',
            'contact_number' => '09111111111',
            'is_active'      => true,
        ]);

        $this->pharmacyB = Pharmacy::create([
            'pharmacy_name'  => 'Branch Beta',
            'location'       => 'City B',
            'contact_number' => '09222222222',
            'is_active'      => true,
        ]);

        $this->adminA = User::factory()->create([
            'role'        => 'pharmacy_admin',
            'pharmacy_id' => $this->pharmacyA->id,
        ]);

        $this->adminB = User::factory()->create([
            'role'        => 'pharmacy_admin',
            'pharmacy_id' => $this->pharmacyB->id,
        ]);

        $this->superAdmin = User::factory()->create([
            'role' => 'super_admin',
        ]);

        $this->categoryVitamins = Category::create([
            'category_name'          => 'Vitamins',
            'hero_title'             => 'Immunity & Daily Wellness',
            'hero_subtitle_template' => 'Since you recently bought {product_name}, check out these top vitamins and daily health boosters',
            'is_enabled'             => true,
        ]);

        $this->categoryDiapers = Category::create([
            'category_name'          => 'Diapers',
            'hero_title'             => 'Baby & Child Care Essentials',
            'hero_subtitle_template' => 'Based on your purchase of {product_name}, here are recommended diapers, formulas, and baby care items',
            'is_enabled'             => true,
        ]);
    }

    public function test_pharmacy_admin_cannot_create_master_category(): void
    {
        Sanctum::actingAs($this->adminA, ['pharmacy_admin']);

        $res = $this->postJson('/api/pharmacy/categories/store', [
            'name' => 'New Category',
        ]);

        $res->assertStatus(403);
    }

    public function test_super_admin_can_create_master_category(): void
    {
        Sanctum::actingAs($this->superAdmin, ['super_admin']);

        $res = $this->postJson('/api/pharmacy/categories/store', [
            'name'                   => 'First Aid',
            'hero_title'             => 'First Aid & Medical Supplies',
            'hero_subtitle_template' => 'Since you bought {product_name}, keep your home prepared with these essential medical supplies',
        ]);

        $res->assertStatus(201);
        $this->assertDatabaseHas('categories', ['category_name' => 'First Aid']);
    }

    public function test_branch_can_toggle_category_without_affecting_other_branches(): void
    {
        Sanctum::actingAs($this->adminA, ['pharmacy_admin']);

        // Disable Vitamins in Branch A
        $res = $this->patchJson("/api/pharmacy/categories/{$this->categoryVitamins->id}/toggle-status", [
            'enabled' => false,
        ]);
        $res->assertStatus(200);

        // Branch A categories list should show enabled = false
        $resA = $this->getJson('/api/pharmacy/categories/all');
        $resA->assertStatus(200);
        $vitA = collect($resA->json('data'))->firstWhere('id', $this->categoryVitamins->id);
        $this->assertFalse($vitA['enabled']);

        // Branch B categories list should remain enabled = true
        Sanctum::actingAs($this->adminB, ['pharmacy_admin']);
        $resB = $this->getJson('/api/pharmacy/categories/all');
        $resB->assertStatus(200);
        $vitB = collect($resB->json('data'))->firstWhere('id', $this->categoryVitamins->id);
        $this->assertTrue($vitB['enabled']);
    }

    public function test_show_pharmacy_categories_service_excludes_branch_disabled_categories(): void
    {
        $prod = Products::create([
            'product_name' => 'Vitamin C 500mg',
            'product_type' => 'branded',
        ]);

        PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacyA->id,
            'product_id'    => $prod->id,
            'category_id'   => $this->categoryVitamins->id,
            'stock'         => 10,
            'selling_price' => 100,
        ]);

        PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacyB->id,
            'product_id'    => $prod->id,
            'category_id'   => $this->categoryVitamins->id,
            'stock'         => 10,
            'selling_price' => 100,
        ]);

        // Branch A disables Vitamins
        PharmacyCategory::create([
            'pharmacy_id' => $this->pharmacyA->id,
            'category_id' => $this->categoryVitamins->id,
            'is_enabled'  => false,
        ]);

        /** @var ShowPharmacyCategoriesService $service */
        $service = app(ShowPharmacyCategoriesService::class);

        $categoriesA = $service->handle($this->pharmacyA->id, true);
        $this->assertFalse($categoriesA->contains('id', $this->categoryVitamins->id));

        $categoriesB = $service->handle($this->pharmacyB->id, true);
        $this->assertTrue($categoriesB->contains('id', $this->categoryVitamins->id));
    }

    public function test_customer_recommendation_hero_text_fetches_from_database_category(): void
    {
        $userCustomer = User::factory()->create(['role' => 'customer']);
        $customer = Customer::create([
            'user_id' => $userCustomer->id,
        ]);

        $prod = Products::create([
            'product_name' => 'Enfamil A+ Infant Formula 800g',
            'product_type' => 'branded',
        ]);

        $pharmacyProduct = PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacyA->id,
            'product_id'    => $prod->id,
            'category_id'   => $this->categoryDiapers->id,
            'stock'         => 15,
            'selling_price' => 450,
        ]);

        $order = Order::create([
            'order_number' => 'ORD-TEST-1',
            'customer_id'  => $customer->id,
            'pharmacy_id'  => $this->pharmacyA->id,
            'status'       => 'completed',
            'subtotal'     => 450,
            'total_amount' => 450,
            'completed_at' => now(),
        ]);

        OrderItem::create([
            'order_id'            => $order->id,
            'pharmacy_product_id' => $pharmacyProduct->id,
            'product_name'        => 'Enfamil A+ Infant Formula 800g',
            'quantity'            => 1,
            'unit_price_snapshot' => 450,
            'line_total'          => 450,
        ]);

        /** @var CustomerRecommendationService $recService */
        $recService = app(CustomerRecommendationService::class);
        $result = $recService->getRecommendations($userCustomer, $this->pharmacyA->id);

        $this->assertEquals('Baby & Child Care Essentials', $result['hero_title']);
        $this->assertEquals(
            'Based on your purchase of Enfamil A+ Infant Formula 800g, here are recommended diapers, formulas, and baby care items',
            $result['hero_subtitle']
        );
    }
}

