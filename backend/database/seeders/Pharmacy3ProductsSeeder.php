<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;

class Pharmacy3ProductsSeeder extends Seeder
{
    /**
     * Run the database seeds for Client 3 (Mishka's Pharmacy).
     */
    public function run(): void
    {
        $jsonPath = database_path('seeders/data/pharmacy_3_products.json');

        if (!File::exists($jsonPath)) {
            $this->command?->error("Pharmacy 3 data file not found at: {$jsonPath}");
            return;
        }

        $data = json_decode(File::get($jsonPath), true);
        if (!$data || empty($data['products'])) {
            $this->command?->error("Invalid or empty data in {$jsonPath}");
            return;
        }

        $pharmacyData = $data['pharmacy'];
        $pharmacyId   = (int) env('CLIENT3_PHARMACY_ID', $pharmacyData['id'] ?? 3);

        $driver = DB::getDriverName();
        if ($driver !== 'sqlite') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        }

        DB::transaction(function () use ($data, $pharmacyId, $pharmacyData) {
            // 1. Check & preserve existing Pharmacy record
            $existingPharmacy = DB::table('pharmacies')->where('id', $pharmacyId)->first();
            if (!$existingPharmacy) {
                $pharmacyColumns = Schema::getColumnListing('pharmacies');
                $pharmacyRecord  = array_intersect_key($pharmacyData, array_flip($pharmacyColumns));
                $pharmacyRecord['id'] = $pharmacyId;
                DB::table('pharmacies')->insert($pharmacyRecord);
                $this->command?->info("Created pharmacy placeholder for ID {$pharmacyId}.");
            } else {
                $pharmacyName = $existingPharmacy->pharmacy_name;
                $this->command?->info("Using existing pharmacy from database: '{$pharmacyName}' (ID: {$pharmacyId}). Existing details preserved.");
            }

            // 2. Ensure Categories & Pharmacy Categories
            $this->command?->info("Syncing categories...");
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
                $categoryMap[$catName]   = $targetCatId;

                DB::table('pharmacy_categories')->updateOrInsert(
                    ['pharmacy_id' => $pharmacyId, 'category_id' => $targetCatId],
                    ['is_enabled' => true, 'updated_at' => now(), 'created_at' => now()]
                );
            }

            // 3. Upsert Base Products
            $productColumns = [
                'id', 'pharmacy_id', 'product_type', 'product_name', 'generic_name',
                'brand_name', 'description', 'form', 'strength', 'size',
                'is_prescribed', 'image_path', 'created_at', 'updated_at'
            ];
            $productsToInsert = [];
            foreach ($data['products'] as $p) {
                $row = [];
                foreach ($productColumns as $col) {
                    $row[$col] = $p[$col] ?? null;
                }
                $row['pharmacy_id'] = $pharmacyId;
                $productsToInsert[] = $row;
            }

            $this->command?->info("Importing " . count($productsToInsert) . " base products...");
            foreach (array_chunk($productsToInsert, 250) as $chunk) {
                DB::table('products')->upsert(
                    $chunk,
                    ['id'],
                    ['pharmacy_id', 'product_type', 'product_name', 'generic_name', 'brand_name', 'description', 'form', 'strength', 'size', 'is_prescribed', 'image_path', 'updated_at']
                );
            }

            // 4. Upsert Pharmacy Products (Inventory)
            $ppColumns = [
                'id', 'pharmacy_id', 'product_id', 'category_id', 'stock',
                'unit_cost', 'selling_price', 'is_discountable', 'is_available',
                'is_out_of_stock', 'is_expired', 'lead_time_days', 'ordered_at',
                'created_at', 'updated_at'
            ];
            $pharmacyProductsToInsert = [];
            foreach ($data['pharmacy_products'] as $pp) {
                $row = [];
                $originalCatId   = $pp['category_id'] ?? null;
                $categoryName    = $pp['category_name'] ?? null;
                $mappedCatId     = $categoryMap[$originalCatId] ?? ($categoryName ? ($categoryMap[$categoryName] ?? $originalCatId) : $originalCatId);

                foreach ($ppColumns as $col) {
                    if ($col === 'category_id') {
                        $row[$col] = $mappedCatId;
                    } elseif ($col === 'pharmacy_id') {
                        $row[$col] = $pharmacyId;
                    } else {
                        $row[$col] = $pp[$col] ?? null;
                    }
                }
                $pharmacyProductsToInsert[] = $row;
            }

            $this->command?->info("Importing " . count($pharmacyProductsToInsert) . " pharmacy products...");
            foreach (array_chunk($pharmacyProductsToInsert, 250) as $chunk) {
                DB::table('pharmacy_products')->upsert(
                    $chunk,
                    ['id'],
                    ['pharmacy_id', 'product_id', 'category_id', 'stock', 'unit_cost', 'selling_price', 'is_discountable', 'is_available', 'is_out_of_stock', 'is_expired', 'lead_time_days', 'ordered_at', 'updated_at']
                );
            }

            // 5. Upsert Product Batches
            if (!empty($data['batches'])) {
                $batchColumns = [
                    'id', 'pharmacy_product_id', 'batch_number', 'supplier_name',
                    'stock', 'expiry_date', 'manufactured_date', 'received_at',
                    'created_at', 'updated_at'
                ];
                $batchesToInsert = [];
                foreach ($data['batches'] as $b) {
                    $row = [];
                    foreach ($batchColumns as $col) {
                        $row[$col] = $b[$col] ?? null;
                    }
                    $batchesToInsert[] = $row;
                }

                $this->command?->info("Importing " . count($batchesToInsert) . " product batches...");
                foreach (array_chunk($batchesToInsert, 250) as $chunk) {
                    DB::table('product_batches')->upsert(
                        $chunk,
                        ['id'],
                        ['pharmacy_product_id', 'batch_number', 'supplier_name', 'stock', 'expiry_date', 'manufactured_date', 'received_at', 'updated_at']
                    );
                }
            }
        });

        // Reset AUTO_INCREMENT and restore FOREIGN_KEY_CHECKS
        if ($driver !== 'sqlite') {
            $maxProdId = DB::table('products')->max('id') ?? 1;
            $maxPpId   = DB::table('pharmacy_products')->max('id') ?? 1;
            $maxBatchId= DB::table('product_batches')->max('id') ?? 1;

            DB::statement("ALTER TABLE products AUTO_INCREMENT = " . ($maxProdId + 1));
            DB::statement("ALTER TABLE pharmacy_products AUTO_INCREMENT = " . ($maxPpId + 1));
            DB::statement("ALTER TABLE product_batches AUTO_INCREMENT = " . ($maxBatchId + 1));

            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        $this->command?->newLine();
        $this->command?->info("Import completed successfully for Pharmacy ID {$pharmacyId} ({$pharmacyData['pharmacy_name']})!");
        $this->command?->table(
            ['Entity', 'Imported Count'],
            [
                ['Categories Synced', count($data['categories'] ?? [])],
                ['Base Products', count($data['products'] ?? [])],
                ['Pharmacy Products', count($data['pharmacy_products'] ?? [])],
                ['Product Batches', count($data['batches'] ?? [])],
            ]
        );
    }
}
