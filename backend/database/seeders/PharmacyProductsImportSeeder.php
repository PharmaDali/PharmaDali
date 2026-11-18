<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class PharmacyProductsImportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $files = File::glob(database_path('seeders/data/pharmacy_*_products.json'));

        if (empty($files)) {
            $this->command?->error("No export files found at: " . database_path('seeders/data/'));
            $this->command?->line("Please run: php artisan pharmacy:export-products {id} first.");
            return;
        }

        // Sort files to ensure deterministic order (pharmacy_1, pharmacy_2, etc.)
        sort($files);

        $driver = DB::getDriverName();
        if ($driver !== 'sqlite') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        }

        foreach ($files as $filePath) {
            $json = File::get($filePath);
            $data = json_decode($json, true);

            if (!$data || empty($data['products'])) {
                $this->command?->warn("File {$filePath} is empty or invalid JSON. Skipping.");
                continue;
            }

            $pharmacyData = $data['pharmacy'] ?? null;
            $pharmacyId   = $pharmacyData['id'] ?? 1;

            $this->command?->info("Starting import for Pharmacy ID {$pharmacyId} (" . ($pharmacyData['pharmacy_name'] ?? 'Pharmacy') . ")...");

            DB::transaction(function () use ($data, $pharmacyId, $pharmacyData) {
            // 1. Sync & Seed Pharmacy record
            if ($pharmacyData) {
                $existingPharmacy = DB::table('pharmacies')->where('id', $pharmacyId)->first();
                if (!$existingPharmacy) {
                    $pharmacyColumns = Schema::getColumnListing('pharmacies');
                    $pharmacyRecord  = array_intersect_key($pharmacyData, array_flip($pharmacyColumns));
                    $pharmacyName    = $pharmacyRecord['pharmacy_name'] ?? "Pharmacy {$pharmacyId}";
                    $this->command?->info("Creating pharmacy record for {$pharmacyName} (ID: {$pharmacyId})...");
                    DB::table('pharmacies')->insert($pharmacyRecord);
                } else {
                    $pharmacyName = $existingPharmacy->pharmacy_name;
                    $this->command?->info("Preserving existing pharmacy record: '{$pharmacyName}' (ID: {$pharmacyId}).");
                }
            }

            // 2. Map & Ensure Categories
            $this->command->info("Syncing categories...");
            $categoryMap = [];
            foreach ($data['categories'] ?? [] as $cat) {
                $catName = trim($cat['category_name']);
                $existingCat = DB::table('categories')
                    ->whereRaw('LOWER(TRIM(category_name)) = ?', [strtolower($catName)])
                    ->first();

                if ($existingCat) {
                    $targetCatId = $existingCat->id;
                } else {
                    $targetCatId = DB::table('categories')->insertGetId([
                        'category_name'          => $cat['category_name'],
                        'description'            => $cat['description'] ?? "Description for {$cat['category_name']}",
                        'is_enabled'             => $cat['is_enabled'] ?? 1,
                        'background_color'       => $cat['background_color'] ?? '#48AAD9',
                        'font_color'             => $cat['font_color'] ?? '#FFFFFF',
                        'hero_title'             => $cat['hero_title'] ?? 'Health & Recovery Recommendations',
                        'hero_subtitle_template' => $cat['hero_subtitle_template'] ?? 'Recommended products for you',
                        'created_at'             => now(),
                        'updated_at'             => now(),
                    ]);
                }

                $categoryMap[$cat['id']] = $targetCatId;

                DB::table('pharmacy_categories')->updateOrInsert(
                    ['pharmacy_id' => $pharmacyId, 'category_id' => $targetCatId],
                    ['is_enabled' => true, 'updated_at' => now(), 'created_at' => now()]
                );
            }

            // 3. Index source pharmacy_products and batches by their local IDs for lookup
            $localPpByProductId = [];
            foreach ($data['pharmacy_products'] ?? [] as $pp) {
                $localPpByProductId[$pp['product_id']] = $pp;
            }

            $localBatchesByPpId = [];
            foreach ($data['batches'] ?? [] as $b) {
                $localBatchesByPpId[$b['pharmacy_product_id']][] = $b;
            }

            // Load existing products on this server for this pharmacy to avoid overwriting anything
            $existingProducts = DB::table('products')
                ->where('pharmacy_id', $pharmacyId)
                ->select('id', 'product_name', 'image_path')
                ->get();

            $existingNamesMap = [];
            $existingImageHashesMap = [];
            foreach ($existingProducts as $ep) {
                $existingNamesMap[strtolower(trim((string) $ep->product_name))] = $ep->id;
                if (!empty($ep->image_path) && preg_match('/_([a-f0-9]{8})\.[a-z0-9]+$/i', (string) $ep->image_path, $m)) {
                    $existingImageHashesMap[strtolower($m[1])] = $ep->id;
                }
            }

            $insertedProductsCount = 0;
            $skippedExistingCount = 0;
            $insertedPpCount = 0;
            $insertedBatchesCount = 0;
            $now = now();

            foreach ($data['products'] as $p) {
                $localProductId = $p['id'];
                $normName = strtolower(trim((string) ($p['product_name'] ?? '')));
                if ($normName === '') {
                    continue;
                }

                $imgHash = null;
                if (!empty($p['image_path']) && preg_match('/_([a-f0-9]{8})\.[a-z0-9]+$/i', (string) $p['image_path'], $m)) {
                    $imgHash = strtolower($m[1]);
                }

                // If product already exists on the server (by name or image hash), DO NOT overwrite it
                if (isset($existingNamesMap[$normName]) || ($imgHash && isset($existingImageHashesMap[$imgHash]))) {
                    $skippedExistingCount++;
                    continue;
                }

                // Insert NEW Base Product (letting the server assign a safe auto-increment ID)
                $newProductId = DB::table('products')->insertGetId([
                    'pharmacy_id'   => $pharmacyId,
                    'product_type'  => $p['product_type'] ?? 'medicine',
                    'product_name'  => $p['product_name'],
                    'generic_name'  => $p['generic_name'] ?? null,
                    'brand_name'    => $p['brand_name'] ?? null,
                    'description'   => $p['description'] ?? null,
                    'form'          => $p['form'] ?? null,
                    'strength'      => $p['strength'] ?? null,
                    'size'          => $p['size'] ?? null,
                    'is_prescribed' => $p['is_prescribed'] ?? 0,
                    'image_path'    => $p['image_path'] ?? null,
                    'created_at'    => $p['created_at'] ?? $now,
                    'updated_at'    => $p['updated_at'] ?? $now,
                ]);

                $existingNamesMap[$normName] = $newProductId;
                if ($imgHash) {
                    $existingImageHashesMap[$imgHash] = $newProductId;
                }
                $insertedProductsCount++;

                // Insert corresponding PharmacyProduct (Inventory)
                $localPp = $localPpByProductId[$localProductId] ?? null;
                if ($localPp) {
                    $localPpId     = $localPp['id'];
                    $originalCatId = $localPp['category_id'] ?? null;
                    $mappedCatId   = $categoryMap[$originalCatId] ?? $originalCatId;

                    $newPpId = DB::table('pharmacy_products')->insertGetId([
                        'pharmacy_id'     => $pharmacyId,
                        'product_id'      => $newProductId,
                        'category_id'     => $mappedCatId,
                        'stock'           => $localPp['stock'] ?? 100,
                        'unit_cost'       => $localPp['unit_cost'] ?? 0,
                        'selling_price'   => $localPp['selling_price'] ?? 0,
                        'is_discountable' => $localPp['is_discountable'] ?? 1,
                        'is_available'    => $localPp['is_available'] ?? 1,
                        'is_out_of_stock' => $localPp['is_out_of_stock'] ?? 0,
                        'is_expired'      => $localPp['is_expired'] ?? 0,
                        'lead_time_days'  => $localPp['lead_time_days'] ?? 3,
                        'ordered_at'      => $localPp['ordered_at'] ?? null,
                        'created_at'      => $localPp['created_at'] ?? $now,
                        'updated_at'      => $localPp['updated_at'] ?? $now,
                    ]);
                    $insertedPpCount++;

                    // Insert corresponding ProductBatches
                    foreach ($localBatchesByPpId[$localPpId] ?? [] as $b) {
                        DB::table('product_batches')->insert([
                            'pharmacy_product_id' => $newPpId,
                            'batch_number'        => $b['batch_number'] ?? ('STAGING-' . strtoupper(substr(md5($newProductId . '-' . $pharmacyId), 0, 8))),
                            'supplier_name'       => $b['supplier_name'] ?? 'PharmaDali Staging Supplier',
                            'stock'               => $b['stock'] ?? ($localPp['stock'] ?? 100),
                            'expiry_date'         => $b['expiry_date'] ?? now()->addMonths(18)->toDateString(),
                            'manufactured_date'   => $b['manufactured_date'] ?? now()->subMonths(2)->toDateString(),
                            'received_at'         => $b['received_at'] ?? $now,
                            'created_at'          => $b['created_at'] ?? $now,
                            'updated_at'          => $b['updated_at'] ?? $now,
                        ]);
                        $insertedBatchesCount++;
                    }
                }
            }

            $this->command?->info("  -> Added {$insertedProductsCount} new products (skipped {$skippedExistingCount} already-existing products).");
        });

            $this->command?->newLine();
            $this->command?->info("Import completed successfully for Pharmacy ID {$pharmacyId}!");
        }

        // Reset AUTO_INCREMENT and restore FOREIGN_KEY_CHECKS outside the loop
        if ($driver !== 'sqlite') {
            $maxProdId = DB::table('products')->max('id') ?? 1;
            $maxPpId   = DB::table('pharmacy_products')->max('id') ?? 1;
            $maxBatchId= DB::table('product_batches')->max('id') ?? 1;

            DB::statement("ALTER TABLE products AUTO_INCREMENT = " . ($maxProdId + 1));
            DB::statement("ALTER TABLE pharmacy_products AUTO_INCREMENT = " . ($maxPpId + 1));
            DB::statement("ALTER TABLE product_batches AUTO_INCREMENT = " . ($maxBatchId + 1));

            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }
    }
}
