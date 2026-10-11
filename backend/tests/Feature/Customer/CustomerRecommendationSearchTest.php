<?php

namespace Tests\Feature\Customer;

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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerRecommendationSearchTest extends TestCase
{
    use RefreshDatabase;

    private Pharmacy $pharmacy;
    private User $userCustomer;
    private Customer $customer;
    private Category $categoryVitamins;
    private Category $categoryPain;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pharmacy = Pharmacy::create([
            'pharmacy_name'  => 'Central Branch',
            'location'       => 'City Center',
            'contact_number' => '09123456789',
            'is_active'      => true,
        ]);

        $this->userCustomer = User::factory()->create([
            'role' => 'customer',
        ]);

        $this->customer = Customer::create([
            'user_id' => $this->userCustomer->id,
        ]);

        $this->categoryVitamins = Category::create([
            'category_name'          => 'Vitamins and Supplements',
            'hero_title'             => 'Immunity Essentials',
            'hero_subtitle_template' => 'Based on your purchase of {product_name}, check out these vitamins',
            'is_enabled'             => true,
        ]);

        $this->categoryPain = Category::create([
            'category_name'          => 'Pain Relief',
            'hero_title'             => 'Pain Management',
            'hero_subtitle_template' => 'Based on your purchase of {product_name}, here are complementary items',
            'is_enabled'             => true,
        ]);
    }

    public function test_empty_recent_searches_without_history_falls_back_to_vitamins(): void
    {
        $vitaminProd = Products::create([
            'product_name' => 'Vitamin C 500mg',
            'product_type' => 'branded',
        ]);

        $pharmacyProduct = PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $vitaminProd->id,
            'category_id'   => $this->categoryVitamins->id,
            'stock'         => 20,
            'selling_price' => 15,
        ]);

        /** @var CustomerRecommendationService $service */
        $service = app(CustomerRecommendationService::class);
        $result = $service->getRecommendations($this->userCustomer, $this->pharmacy->id, 1, 10, []);

        $this->assertEquals('Stay Healthy!', $result['hero_title']);
        $this->assertEquals('Stock up on our recommended Vitamins & Healthcare Essentials.', $result['hero_subtitle']);
        $this->assertNotEmpty($result['recommendations']);
        $this->assertTrue($result['recommendations']->contains('id', $pharmacyProduct->id));
    }

    public function test_empty_recent_searches_with_order_history_uses_category_hero(): void
    {
        $painProd = Products::create([
            'product_name' => 'Biogesic Paracetamol 500mg',
            'product_type' => 'branded',
        ]);

        $pharmacyProduct = PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $painProd->id,
            'category_id'   => $this->categoryPain->id,
            'stock'         => 30,
            'selling_price' => 10,
        ]);

        $order = Order::create([
            'order_number' => 'ORD-SEARCH-01',
            'customer_id'  => $this->customer->id,
            'pharmacy_id'  => $this->pharmacy->id,
            'status'       => 'completed',
            'subtotal'     => 10,
            'total_amount' => 10,
            'completed_at' => now(),
        ]);

        OrderItem::create([
            'order_id'            => $order->id,
            'pharmacy_product_id' => $pharmacyProduct->id,
            'product_name'        => 'Biogesic Paracetamol 500mg',
            'quantity'            => 1,
            'unit_price_snapshot' => 10,
            'line_total'          => 10,
        ]);

        /** @var CustomerRecommendationService $service */
        $service = app(CustomerRecommendationService::class);
        $result = $service->getRecommendations($this->userCustomer, $this->pharmacy->id, 1, 10, []);

        $this->assertEquals('Pain Management', $result['hero_title']);
        $this->assertEquals('Based on your purchase of Biogesic Paracetamol 500mg, here are complementary items', $result['hero_subtitle']);
    }

    public function test_recent_searches_match_prioritizes_search_intent_and_updates_hero(): void
    {
        $prodA = Products::create([
            'product_name' => 'Neozep Forte',
            'generic_name' => 'Phenylephrine HCl / Chlorphenamine / Paracetamol',
            'brand_name'   => 'Neozep',
            'product_type' => 'branded',
        ]);

        $pharmacyProductA = PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $prodA->id,
            'category_id'   => $this->categoryPain->id,
            'stock'         => 50,
            'selling_price' => 12,
        ]);

        /** @var CustomerRecommendationService $service */
        $service = app(CustomerRecommendationService::class);
        $result = $service->getRecommendations($this->userCustomer, $this->pharmacy->id, 1, 10, ['neozep']);

        $this->assertEquals('Looking for Neozep?', $result['hero_title']);
        $this->assertEquals('Based on your recent search for neozep, here are items available at your selected branch.', $result['hero_subtitle']);
        $this->assertNotEmpty($result['recommendations']);
        $this->assertEquals($pharmacyProductA->id, $result['recommendations']->first()->id);
    }

    public function test_recent_searches_discover_apriori_cross_sell_rules(): void
    {
        $prodA = Products::create([
            'product_name' => 'Biogesic Tablet',
            'generic_name' => 'Paracetamol',
            'brand_name'   => 'Biogesic',
            'product_type' => 'branded',
        ]);

        $pharmacyProductA = PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $prodA->id,
            'category_id'   => $this->categoryPain->id,
            'stock'         => 25,
            'selling_price' => 8,
        ]);

        $prodB = Products::create([
            'product_name' => 'Ascorbic Acid Vitamin C',
            'generic_name' => 'Ascorbic Acid',
            'brand_name'   => 'Ceelin',
            'product_type' => 'branded',
        ]);

        $pharmacyProductB = PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $prodB->id,
            'category_id'   => $this->categoryVitamins->id,
            'stock'         => 40,
            'selling_price' => 15,
        ]);

        // Mock cached Apriori rule: Biogesic -> Ceelin
        Cache::put("apriori_rules_pharmacy_{$this->pharmacy->id}", [
            'rules' => [
                [
                    'antecedent_id' => $pharmacyProductA->id,
                    'consequent_id' => $pharmacyProductB->id,
                    'support'       => 0.4,
                    'confidence'    => 0.8,
                ],
            ],
        ], 3600);

        /** @var CustomerRecommendationService $service */
        $service = app(CustomerRecommendationService::class);
        $result = $service->getRecommendations($this->userCustomer, $this->pharmacy->id, 1, 10, ['biogesic']);

        $recIds = $result['recommendations']->pluck('id')->toArray();
        $this->assertContains($pharmacyProductA->id, $recIds);
        $this->assertContains($pharmacyProductB->id, $recIds);
    }

    public function test_out_of_stock_products_are_excluded_from_search_intent(): void
    {
        $prod = Products::create([
            'product_name' => 'Medicol Advance',
            'generic_name' => 'Ibuprofen',
            'brand_name'   => 'Medicol',
            'product_type' => 'branded',
        ]);

        PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $prod->id,
            'category_id'   => $this->categoryPain->id,
            'stock'         => 0,
            'selling_price' => 15,
        ]);

        /** @var CustomerRecommendationService $service */
        $service = app(CustomerRecommendationService::class);
        $result = $service->getRecommendations($this->userCustomer, $this->pharmacy->id, 1, 10, ['medicol']);

        // Because the searched product is out of stock, it should not match and should fallback to vitamins
        $this->assertNotEquals('Looking for Medicol?', $result['hero_title']);
        $this->assertEquals('Stay Healthy!', $result['hero_title']);
    }

    public function test_disabled_branch_category_products_are_excluded(): void
    {
        $prod = Products::create([
            'product_name' => 'Alaxan FR',
            'generic_name' => 'Ibuprofen + Paracetamol',
            'brand_name'   => 'Alaxan',
            'product_type' => 'branded',
        ]);

        $pharmacyProduct = PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $prod->id,
            'category_id'   => $this->categoryPain->id,
            'stock'         => 20,
            'selling_price' => 14,
        ]);

        // Branch disables the Pain Relief category
        PharmacyCategory::create([
            'pharmacy_id' => $this->pharmacy->id,
            'category_id' => $this->categoryPain->id,
            'is_enabled'  => false,
        ]);

        /** @var CustomerRecommendationService $service */
        $service = app(CustomerRecommendationService::class);
        $result = $service->getRecommendations($this->userCustomer, $this->pharmacy->id, 1, 10, ['alaxan']);

        $recIds = $result['recommendations']->pluck('id')->toArray();
        $this->assertNotContains($pharmacyProduct->id, $recIds);
        $this->assertNotEquals('Looking for Alaxan?', $result['hero_title']);
    }

    public function test_api_endpoint_handles_recent_searches_query_parameters(): void
    {
        Sanctum::actingAs($this->userCustomer, ['customer']);

        $prod = Products::create([
            'product_name' => 'Bioflu 500mg',
            'generic_name' => 'Phenylephrine HCl / Chlorphenamine / Paracetamol',
            'brand_name'   => 'Bioflu',
            'product_type' => 'branded',
        ]);

        $pharmacyProduct = PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $prod->id,
            'category_id'   => $this->categoryPain->id,
            'stock'         => 15,
            'selling_price' => 11,
        ]);

        $response = $this->getJson("/api/customer/recommendations/hero?pharmacy_id={$this->pharmacy->id}&recent_searches[]=bioflu");

        $response->assertStatus(200);
        $response->assertJsonPath('data.hero_title', 'Looking for Bioflu?');
        $this->assertNotEmpty($response->json('data.recommendations'));
        $this->assertEquals($pharmacyProduct->id, $response->json('data.recommendations.0.id'));
    }

    public function test_api_endpoint_validates_recent_searches_maximum_limit(): void
    {
        Sanctum::actingAs($this->userCustomer, ['customer']);

        $query = http_build_query([
            'pharmacy_id'     => $this->pharmacy->id,
            'recent_searches' => ['one', 'two', 'three', 'four', 'five', 'six'],
        ]);

        $response = $this->getJson("/api/customer/recommendations/hero?{$query}");
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['recent_searches']);
    }

    public function test_order_history_prioritizes_apriori_hero_even_when_recent_searches_exist(): void
    {
        $painProd = Products::create([
            'product_name' => 'Biogesic Paracetamol 500mg',
            'product_type' => 'branded',
        ]);

        $pharmacyProduct = PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $painProd->id,
            'category_id'   => $this->categoryPain->id,
            'stock'         => 30,
            'selling_price' => 10,
        ]);

        $order = Order::create([
            'order_number' => 'ORD-SEARCH-02',
            'customer_id'  => $this->customer->id,
            'pharmacy_id'  => $this->pharmacy->id,
            'status'       => 'completed',
            'subtotal'     => 10,
            'total_amount' => 10,
            'completed_at' => now(),
        ]);

        OrderItem::create([
            'order_id'            => $order->id,
            'pharmacy_product_id' => $pharmacyProduct->id,
            'product_name'        => 'Biogesic Paracetamol 500mg',
            'quantity'            => 1,
            'unit_price_snapshot' => 10,
            'line_total'          => 10,
        ]);

        $searchProd = Products::create([
            'product_name' => 'Biofit Tea /pc',
            'product_type' => 'branded',
        ]);

        PharmacyProduct::create([
            'pharmacy_id'   => $this->pharmacy->id,
            'product_id'    => $searchProd->id,
            'category_id'   => $this->categoryVitamins->id,
            'stock'         => 20,
            'selling_price' => 25,
        ]);

        /** @var CustomerRecommendationService $service */
        $service = app(CustomerRecommendationService::class);
        $result = $service->getRecommendations($this->userCustomer, $this->pharmacy->id, 1, 10, ['biofit']);

        // Since the customer has past completed orders, hero section prioritizes Apriori order history
        $this->assertEquals('Pain Management', $result['hero_title']);
        $this->assertEquals('Based on your purchase of Biogesic Paracetamol 500mg, here are complementary items', $result['hero_subtitle']);
    }
}


