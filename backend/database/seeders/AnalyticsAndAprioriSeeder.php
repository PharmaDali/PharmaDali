<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PharmacyProduct;
use App\Models\Pharmacy;
use App\Models\Customer;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AnalyticsAndAprioriSeeder extends Seeder
{
    /**
     * Run the database seeds for Demand, Sales, and Market Basket (Apriori).
     */
    public function run(): void
    {
        $pharmacies = Pharmacy::all();
        if ($pharmacies->isEmpty()) {
            $this->command->warn('No pharmacies found. Please seed pharmacies first.');
            return;
        }

        $customer = Customer::first();
        $customerId = $customer ? $customer->id : 1;

        foreach ($pharmacies as $pharmacy) {
            $products = PharmacyProduct::with('product')
                ->where('pharmacy_id', $pharmacy->id)
                ->get();

            if ($products->count() < 3) {
                // If this pharmacy doesn't have enough products, fetch all products
                $products = PharmacyProduct::with('product')->get();
            }

            if ($products->isEmpty()) {
                $this->command->warn("No pharmacy products available for pharmacy ID: {$pharmacy->id}");
                continue;
            }

            // Group products into co-occurrence bundles to guarantee Apriori pattern generation
            $productList = $products->values();
            $pCount = $productList->count();

            // Select distinct anchor product pairs for high co-occurrence rules
            $prodA = $productList[0 % $pCount];
            $prodB = $productList[1 % $pCount];
            $prodC = $productList[2 % $pCount];
            $prodD = $productList[3 % $pCount] ?? $prodA;

            $this->command->info("Generating historical orders for Pharmacy: {$pharmacy->name} (ID: {$pharmacy->id})...");

            // Generate 80 historical completed orders spread over the past 60 days
            for ($i = 0; $i < 80; $i++) {
                // Random completion date within past 60 days
                $daysAgo = rand(0, 60);
                $completedAt = Carbon::now()->subDays($daysAgo)->subHours(rand(1, 12));

                $order = Order::create([
                    'order_number' => 'ORD-' . strtoupper(Str::random(8)),
                    'customer_id' => $customerId,
                    'pharmacy_id' => $pharmacy->id,
                    'status' => 'completed',
                    'payment_method' => rand(0, 1) ? 'cash' : 'online',
                    'payment_status' => 'paid',
                    'subtotal' => 0,
                    'discount_amount' => 0,
                    'total_amount' => 0,
                    'placed_at' => $completedAt->copy()->subMinutes(rand(10, 60)),
                    'completed_at' => $completedAt,
                    'created_at' => $completedAt,
                    'updated_at' => $completedAt,
                ]);

                // Determine basket items based on predefined Apriori probability patterns
                $basketProducts = [];
                $roll = rand(1, 100);

                if ($roll <= 45) {
                    // Pattern 1: High co-occurrence of ProdA + ProdB (Apriori Rule)
                    $basketProducts[] = $prodA;
                    $basketProducts[] = $prodB;
                    if (rand(0, 1)) {
                        $basketProducts[] = $prodC;
                    }
                } elseif ($roll <= 75) {
                    // Pattern 2: High co-occurrence of ProdB + ProdC
                    $basketProducts[] = $prodB;
                    $basketProducts[] = $prodC;
                    if (rand(0, 1)) {
                        $basketProducts[] = $prodD;
                    }
                } else {
                    // Pattern 3: Random selection of 1 to 3 products
                    $numItems = rand(1, 3);
                    $randomKeys = (array) array_rand($productList->toArray(), min($numItems, $pCount));
                    foreach ($randomKeys as $key) {
                        $basketProducts[] = $productList[$key];
                    }
                }

                // Remove duplicate products in the same order
                $uniqueBasket = collect($basketProducts)->unique('id');

                $subtotal = 0;
                foreach ($uniqueBasket as $pItem) {
                    $qty = rand(1, 4);
                    $unitPrice = (float) ($pItem->selling_price ?? rand(20, 150));
                    $lineTotal = $qty * $unitPrice;
                    $subtotal += $lineTotal;

                    $productName = $pItem->product->product_name ?? $pItem->product_name ?? 'Pharmacy Product #' . $pItem->id;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'pharmacy_product_id' => $pItem->id,
                        'quantity' => $qty,
                        'unit_price_snapshot' => $unitPrice,
                        'line_total' => $lineTotal,
                        'product_name' => $productName,
                        'created_at' => $completedAt,
                        'updated_at' => $completedAt,
                    ]);
                }

                // Update order totals
                $order->update([
                    'subtotal' => $subtotal,
                    'total_amount' => $subtotal,
                ]);
            }
        }

        $this->command->info('Successfully seeded test data for Demand, Sales, and Apriori Market Basket Analysis!');
    }
}
