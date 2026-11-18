<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PharmacyProduct;
use App\Models\ProductBatch;
use App\Models\Pharmacy;
use App\Models\Customer;
use App\Models\User;
use App\Services\Inventory\RestockPredictorService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AnalyticsAndAprioriSeeder extends Seeder
{
    /**
     * Run the database seeds for Demand, Sales Transactions, Market Basket (Apriori),
     * Expiring Soon, Expired Products, and Priority Restocks across all pharmacies.
     */
    public function run(): void
    {
        $pharmacies = Pharmacy::withoutGlobalScopes()->get();
        if ($pharmacies->isEmpty()) {
            $this->command?->warn('No pharmacies found. Please seed pharmacies first.');
            return;
        }

        $customer = Customer::withoutGlobalScopes()->first();
        if (!$customer) {
            $customerUser = User::firstOrCreate(
                ['email' => 'customer@gmail.com'],
                [
                    'first_name'    => 'Juan',
                    'last_name'     => 'Dela Cruz',
                    'password'      => Hash::make('password1234'),
                    'role'          => 'customer',
                    'mobile_number' => '09174445566',
                    'address'       => 'Tanauan City, Batangas',
                    'is_active'     => true,
                ]
            );
            $customer = Customer::firstOrCreate(['user_id' => $customerUser->id], ['pharmacy_id' => 1]);
        }
        $customerId = $customer->id;

        foreach ($pharmacies as $pharmacy) {
            $products = PharmacyProduct::withoutGlobalScopes()
                ->with(['product', 'batches'])
                ->where('pharmacy_id', $pharmacy->id)
                ->orderByDesc('id')
                ->get();

            if ($products->isEmpty()) {
                $this->command?->warn("No pharmacy products available for pharmacy ID: {$pharmacy->id} ({$pharmacy->pharmacy_name}).");
                continue;
            }

            $productList = $products->values();
            $pCount = $productList->count();

            $this->command?->info("Seeding inventory states & sales transactions for {$pharmacy->pharmacy_name} (ID: {$pharmacy->id}, {$pCount} products)...");

            // =========================================================================
            // 1. CONFIGURE EXPIRING SOON, EXPIRED & PRIORITY RESTOCK PRODUCTS
            // =========================================================================
            // Select dedicated slices of products so each dashboard/inventory filter has rich data:
            // - Index 0..9 (10 products): Priority Restocks (High sales velocity + low remaining stock)
            // - Index 10..19 (10 products): Expiring Soon (Expiry date within 3 to 28 days)
            // - Index 20..25 (6 products): Expired Products (Expiry date 2 to 20 days in the past)
            $priorityRestockProducts = [];
            $expiringSoonOffsets = [3, 5, 7, 10, 12, 14, 18, 21, 25, 28];
            $expiredOffsets      = [2, 5, 9, 14, 18, 25];

            PharmacyProduct::withoutSyncingToSearch(function () use (
                $productList,
                $pCount,
                $pharmacy,
                &$priorityRestockProducts,
                $expiringSoonOffsets,
                $expiredOffsets
            ) {
                // A. Priority Restock Candidates (up to 10 products)
                $restockCount = min(10, $pCount);
                for ($idx = 0; $idx < $restockCount; $idx++) {
                    /** @var PharmacyProduct $pp */
                    $pp = $productList[$idx];
                    $lowStockQty = rand(3, 14);
                    $unitPrice = (float) ($pp->selling_price > 0 ? $pp->selling_price : rand(25, 180));
                    $unitCost = (float) ($pp->unit_cost > 0 ? $pp->unit_cost : round($unitPrice * 0.70, 2));

                    // Update batch stock first
                    $batch = $pp->batches->first();
                    if ($batch) {
                        $batch->expiry_date = Carbon::today()->addMonths(rand(8, 18))->toDateString();
                        $batch->stock = $lowStockQty;
                        $batch->save();

                        // Zero out any extra batches so total stock matches
                        foreach ($pp->batches->slice(1) as $extraBatch) {
                            $extraBatch->stock = 0;
                            $extraBatch->save();
                        }
                    } else {
                        ProductBatch::create([
                            'pharmacy_product_id' => $pp->id,
                            'batch_number'        => 'RSTK-' . strtoupper(substr(md5($pp->id . '-rstk'), 0, 8)),
                            'supplier_name'       => 'PharmaDali Prime Distributor',
                            'stock'               => $lowStockQty,
                            'expiry_date'         => Carbon::today()->addMonths(12)->toDateString(),
                            'manufactured_date'   => Carbon::today()->subMonths(3)->toDateString(),
                            'received_at'         => Carbon::now()->subDays(25),
                        ]);
                    }

                    // Follow CRITICAL ELOQUENT RULE: instantiate & $pharmacyProduct->save()
                    $pp->stock = $lowStockQty;
                    $pp->unit_cost = $unitCost;
                    $pp->selling_price = $unitPrice;
                    $pp->is_available = true;
                    $pp->is_out_of_stock = false;
                    $pp->is_expired = false;
                    $pp->lead_time_days = rand(3, 5);
                    $pp->save();

                    $priorityRestockProducts[] = $pp;
                }

                // B. Expiring Soon Products (next 10 products, expiring within 3..28 days)
                $expiringStart = 10;
                $expiringEnd = min($expiringStart + count($expiringSoonOffsets), $pCount);
                for ($idx = $expiringStart; $idx < $expiringEnd; $idx++) {
                    /** @var PharmacyProduct $pp */
                    $pp = $productList[$idx];
                    $daysUntilExpiry = $expiringSoonOffsets[$idx - $expiringStart] ?? rand(4, 27);
                    $expiryDate = Carbon::today()->addDays($daysUntilExpiry)->toDateString();
                    $mfgDate = Carbon::today()->subMonths(18)->toDateString();
                    $stockQty = rand(25, 85);

                    $batch = $pp->batches->first();
                    if ($batch) {
                        $batch->batch_number = $batch->batch_number ?: ('EXP-SOON-' . strtoupper(substr(md5((string) $pp->id), 0, 6)));
                        $batch->supplier_name = $batch->supplier_name ?: 'Metro Pharma Logistics';
                        $batch->stock = $stockQty;
                        $batch->expiry_date = $expiryDate;
                        $batch->manufactured_date = $mfgDate;
                        $batch->save();
                    } else {
                        ProductBatch::create([
                            'pharmacy_product_id' => $pp->id,
                            'batch_number'        => 'EXP-SOON-' . strtoupper(substr(md5((string) $pp->id), 0, 6)),
                            'supplier_name'       => 'Metro Pharma Logistics',
                            'stock'               => $stockQty,
                            'expiry_date'         => $expiryDate,
                            'manufactured_date'   => $mfgDate,
                            'received_at'         => Carbon::now()->subMonths(6),
                        ]);
                    }

                    $pp->stock = $stockQty;
                    if ((float) $pp->unit_cost <= 0 && (float) $pp->selling_price > 0) {
                        $pp->unit_cost = round((float) $pp->selling_price * 0.70, 2);
                    }
                    $pp->is_available = true;
                    $pp->is_out_of_stock = false;
                    $pp->is_expired = false;
                    $pp->save();
                }

                // C. Expired Products (next 6 products, expired 2..25 days ago)
                $expiredStart = 20;
                $expiredEnd = min($expiredStart + count($expiredOffsets), $pCount);
                for ($idx = $expiredStart; $idx < $expiredEnd; $idx++) {
                    /** @var PharmacyProduct $pp */
                    $pp = $productList[$idx];
                    $daysPastExpiry = $expiredOffsets[$idx - $expiredStart] ?? rand(2, 20);
                    $expiryDate = Carbon::today()->subDays($daysPastExpiry)->toDateString();
                    $mfgDate = Carbon::today()->subMonths(24)->toDateString();
                    $stockQty = rand(15, 60);

                    $batch = $pp->batches->first();
                    if ($batch) {
                        $batch->batch_number = $batch->batch_number ?: ('EXPIRED-' . strtoupper(substr(md5((string) $pp->id), 0, 6)));
                        $batch->supplier_name = $batch->supplier_name ?: 'Unilab Medical Supplies';
                        $batch->stock = $stockQty;
                        $batch->expiry_date = $expiryDate;
                        $batch->manufactured_date = $mfgDate;
                        $batch->save();
                    } else {
                        ProductBatch::create([
                            'pharmacy_product_id' => $pp->id,
                            'batch_number'        => 'EXPIRED-' . strtoupper(substr(md5((string) $pp->id), 0, 6)),
                            'supplier_name'       => 'Unilab Medical Supplies',
                            'stock'               => $stockQty,
                            'expiry_date'         => $expiryDate,
                            'manufactured_date'   => $mfgDate,
                            'received_at'         => Carbon::now()->subMonths(12),
                        ]);
                    }

                    $pp->stock = $stockQty;
                    if ((float) $pp->unit_cost <= 0 && (float) $pp->selling_price > 0) {
                        $pp->unit_cost = round((float) $pp->selling_price * 0.70, 2);
                    }
                    $pp->is_expired = true;
                    $pp->save();
                }

                // Ensure all remaining products have unit_cost populated for accurate Profit & Margin calculation
                foreach ($productList as $pp) {
                    if ((float) $pp->unit_cost <= 0 && (float) $pp->selling_price > 0) {
                        $pp->unit_cost = round((float) $pp->selling_price * 0.70, 2);
                        $pp->save();
                    }
                }
            });

            // =========================================================================
            // 2. SEED SALES TRANSACTIONS (TODAY, PAST 7 DAYS, PAST 30-60 DAYS)
            // =========================================================================
            // Select distinct anchor products for Apriori Market Basket rules AND priority restock velocity
            $prodA = $priorityRestockProducts[0] ?? $productList[0 % $pCount];
            $prodB = $priorityRestockProducts[1] ?? $productList[1 % $pCount];
            $prodC = $priorityRestockProducts[2] ?? $productList[2 % $pCount];
            $prodD = $priorityRestockProducts[3] ?? ($productList[3 % $pCount] ?? $prodA);

            Order::withoutEvents(function () use (
                $pharmacy,
                $customerId,
                $productList,
                $pCount,
                $priorityRestockProducts,
                $prodA,
                $prodB,
                $prodC,
                $prodD
            ) {
                // Remove old seeded orders for idempotency on re-seed if needed
                // A. Seed 12 TODAY's completed sales transactions (POS & Online Pickup)
                for ($t = 0; $t < 12; $t++) {
                    $completedAt = Carbon::now()->subMinutes(rand(5, 360));
                    $isPos = ($t % 2 === 0);

                    $itemsToBuy = [];
                    if (!empty($priorityRestockProducts)) {
                        $itemsToBuy[] = $priorityRestockProducts[$t % count($priorityRestockProducts)];
                        $itemsToBuy[] = $priorityRestockProducts[($t + 1) % count($priorityRestockProducts)];
                    }
                    $itemsToBuy[] = $productList[rand(0, $pCount - 1)];

                    $this->createCompletedOrder(
                        pharmacyId: $pharmacy->id,
                        customerId: $isPos ? null : $customerId,
                        orderPrefix: $isPos ? 'POS-' : 'ORD-',
                        basketProducts: $itemsToBuy,
                        completedAt: $completedAt,
                        minQty: 2,
                        maxQty: 5
                    );
                }

                // B. Seed high-velocity sales in the past 7 days for Priority Restock products
                // Guarantees high ADS (Average Daily Sales >= 3..6 units/day) so DOS <= 3 days & stock <= ROP
                for ($day = 1; $day <= 7; $day++) {
                    for ($o = 0; $o < 4; $o++) {
                        $completedAt = Carbon::now()->subDays($day)->subHours(rand(1, 10));
                        $restockSlice = [];
                        if (!empty($priorityRestockProducts)) {
                            $restockSlice[] = $priorityRestockProducts[($day + $o) % count($priorityRestockProducts)];
                            $restockSlice[] = $priorityRestockProducts[($day + $o + 2) % count($priorityRestockProducts)];
                            $restockSlice[] = $priorityRestockProducts[($day + $o + 4) % count($priorityRestockProducts)];
                        } else {
                            $restockSlice[] = $prodA;
                            $restockSlice[] = $prodB;
                        }

                        $this->createCompletedOrder(
                            pharmacyId: $pharmacy->id,
                            customerId: ($o % 2 === 0) ? null : $customerId,
                            orderPrefix: ($o % 2 === 0) ? 'POS-' : 'ORD-',
                            basketProducts: $restockSlice,
                            completedAt: $completedAt,
                            minQty: 3,
                            maxQty: 6
                        );
                    }
                }

                // C. Seed 80 historical completed orders spread over the past 60 days (for Apriori & Sales Trends)
                for ($i = 0; $i < 80; $i++) {
                    $daysAgo = rand(1, 60);
                    $completedAt = Carbon::now()->subDays($daysAgo)->subHours(rand(1, 12));

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

                    $this->createCompletedOrder(
                        pharmacyId: $pharmacy->id,
                        customerId: $customerId,
                        orderPrefix: 'ORD-',
                        basketProducts: $basketProducts,
                        completedAt: $completedAt,
                        minQty: 1,
                        maxQty: 4
                    );
                }
            });

            // Clear cached priority restocks so new predictions immediately take effect
            try {
                app(RestockPredictorService::class)->clearPriorityRestocksCache($pharmacy->id);
            } catch (\Throwable) {
            }
        }

        // Trigger inventory alerts scan so notifications for Expiring Soon & Priority Restocks are populated
        try {
            \Illuminate\Support\Facades\Artisan::call('inventory:check-alerts');
        } catch (\Throwable) {
        }

        $this->command?->info('Successfully seeded Expiring Soon, Expired Products, Priority Restocks, Sales Transactions, and Apriori data!');
    }

    /**
     * Helper to create a completed order with line items.
     */
    private function createCompletedOrder(
        int $pharmacyId,
        ?int $customerId,
        string $orderPrefix,
        array $basketProducts,
        Carbon $completedAt,
        int $minQty = 1,
        int $maxQty = 4
    ): void {
        $paymentMethod = rand(0, 1) ? 'cash' : 'online';
        $order = Order::create([
            'order_number'    => $orderPrefix . strtoupper(Str::random(8)),
            'customer_id'     => $customerId,
            'pharmacy_id'     => $pharmacyId,
            'status'          => 'completed',
            'payment_method'  => $paymentMethod,
            'payment_status'  => 'paid',
            'subtotal'        => 0,
            'discount_amount' => 0,
            'total_amount'    => 0,
            'amount_received' => 0,
            'change_amount'   => 0,
            'placed_at'       => $completedAt->copy()->subMinutes(rand(10, 45)),
            'picked_up_at'    => $completedAt,
            'completed_at'    => $completedAt,
            'created_at'      => $completedAt,
            'updated_at'      => $completedAt,
        ]);

        $uniqueBasket = collect($basketProducts)->filter()->unique('id');
        $subtotal = 0.0;

        foreach ($uniqueBasket as $pItem) {
            $qty = rand($minQty, $maxQty);
            $unitPrice = (float) ($pItem->selling_price > 0 ? $pItem->selling_price : rand(25, 150));
            $lineTotal = round($qty * $unitPrice, 2);
            $subtotal += $lineTotal;

            $productName = $pItem->product->product_name ?? $pItem->product_name ?? 'Pharmacy Product #' . $pItem->id;

            OrderItem::create([
                'order_id'            => $order->id,
                'pharmacy_product_id' => $pItem->id,
                'quantity'            => $qty,
                'unit_price_snapshot' => $unitPrice,
                'line_total'          => $lineTotal,
                'product_name'        => $productName,
                'created_at'          => $completedAt,
                'updated_at'          => $completedAt,
            ]);
        }

        $order->update([
            'subtotal'        => $subtotal,
            'total_amount'    => $subtotal,
            'amount_received' => $subtotal,
        ]);
    }
}
