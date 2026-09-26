<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use App\Models\Products;
use App\Models\ProductBatch;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ImportInventoryCsv extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pharmacy:import-csv 
                            {--file= : Path to the inventory CSV file}
                            {--pharmacy_id=3 : Target Pharmacy ID in the database}
                            {--fresh : Clear existing products for this pharmacy before importing}
                            {--dry-run : Preview import without modifying the database}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import normalized or raw inventory CSV items into a specified pharmacy catalog';

    public function handle(): int
    {
        $pharmacyId = (int) $this->option('pharmacy_id');
        $dryRun     = (bool) $this->option('dry-run');
        $fresh      = (bool) $this->option('fresh');

        $pharmacy = Pharmacy::find($pharmacyId);
        if (!$pharmacy) {
            $this->error("Pharmacy with ID {$pharmacyId} not found in database.");
            $this->line("Please ensure the pharmacy exists or create it first.");
            return Command::FAILURE;
        }

        $this->info("========================================================================");
        $this->info("Target Pharmacy: {$pharmacy->pharmacy_name} (ID: {$pharmacyId})");
        $this->info($dryRun ? "MODE: [DRY-RUN] (No changes will be saved)" : "MODE: [LIVE IMPORT]");
        $this->info("========================================================================");

        $filePath = $this->option('file') ?: base_path('../Inventory_Items.csv');
        if (!File::exists($filePath)) {
            $filePath = 'c:/Dev/PharmaDali/Inventory_Items.csv';
        }

        if (!File::exists($filePath)) {
            $this->error("CSV file not found at: {$filePath}");
            return Command::FAILURE;
        }

        $this->info("Reading CSV: {$filePath}");

        $handle = fopen($filePath, 'r');
        if (!$handle) {
            $this->error("Could not open CSV file.");
            return Command::FAILURE;
        }

        // Strip UTF-8 BOM if present
        $bom = fread($handle, 3);
        if ($bom !== "\xEF\xBB\xBF") {
            rewind($handle);
        }

        $header = fgetcsv($handle);
        if (!$header) {
            $this->error("CSV file is empty or missing headers.");
            fclose($handle);
            return Command::FAILURE;
        }

        $headerMap = [];
        foreach ($header as $idx => $col) {
            $headerMap[trim(strtolower($col))] = $idx;
        }

        $isNormalized = isset($headerMap['product_name']);
        $this->line($isNormalized ? "Detected format: Normalized CSV" : "Detected format: Client Raw CSV");

        // Prepare Category lookup map (LOWER(category_name) => category_id)
        $allCategories = DB::table('categories')->get()->keyBy(fn($c) => strtolower(trim($c->category_name)));
        $categoryDbMap = [];

        // Build category mapping
        $rawToStandardMap = [
            'branded tab/cap'    => 'Branded',
            'branded/tap cap'    => 'Branded',
            'branded syrup'      => 'Branded',
            'generics tab/cap'   => 'Generic',
            'generic syrup'      => 'Generic',
            'cream/oil/ointment' => 'CREAM/OINTMENT',
            'rub'                => 'CREAM/OINTMENT',
            'petroleum'          => 'CREAM/OINTMENT',
            'supplies'           => 'Supplies',
            'patch'              => 'Supplies',
            'alcohol'            => 'Supplies',
            'milk'               => 'Milk',
            'hygine'             => 'Hygiene',
            'soap'               => 'Hygiene',
            'cosmetics'          => 'Cosmetics',
            'lotion'             => 'Cosmetics',
            'cologne'            => 'Cosmetics',
            'amp/vial'           => 'Injectables/Vial',
            'iv fluids'          => 'Injectables/Vial',
            'diaper'             => 'Diapers',
            'beverages'          => 'Drinks',
            'napkin/liners'      => 'Sanitary',
            'drops'              => 'Eye Med',
            'inhaler/nasal spray'=> 'Branded',
            'spray/inhaler'      => 'Branded',
            'losengez'           => 'Branded',
            'gummies'            => 'Vitamins',
            'pills'              => 'Branded',
            'others'             => 'Others',
        ];

        $rowsToProcess = [];
        while (($row = fgetcsv($handle)) !== false) {
            if (empty(array_filter($row, fn($v) => trim($v) !== ''))) {
                continue;
            }

            if ($isNormalized) {
                $name     = trim($row[$headerMap['product_name']] ?? '');
                $cat      = trim($row[$headerMap['category']] ?? 'Others');
                $priceRaw = $row[$headerMap['selling_price']] ?? '0';
                $costRaw  = $row[$headerMap['unit_cost']] ?? '0';
                $stockRaw = $row[$headerMap['stocks']] ?? '0';
            } else {
                $name     = trim($row[$headerMap['inventoryitemname']] ?? '');
                $catRaw   = trim($row[$headerMap['inventoryitemcategory']] ?? 'Others');
                $priceRaw = $row[$headerMap['inventoryitempriceperqty']] ?? '0';
                $costRaw  = $row[$headerMap['inventoryitemcostperqty'] ?? $headerMap['inventorycostperqty']] ?? '0';
                $stockRaw = $row[$headerMap['inventoryitemqtyonhand']] ?? '0';

                $catLower = strtolower($catRaw);
                $cat = $rawToStandardMap[$catLower] ?? 'Others';
            }

            if ($name === '') {
                continue;
            }

            $price = round((float) $priceRaw, 2);
            $cost  = round((float) $costRaw, 2);
            $stock = max(0, (int) round((float) $stockRaw));

            $rowsToProcess[] = [
                'name'  => $name,
                'cat'   => $cat,
                'price' => $price,
                'cost'  => $cost,
                'stock' => $stock,
            ];
        }
        fclose($handle);

        $totalItems = count($rowsToProcess);
        $this->info("Loaded {$totalItems} valid product items to process.");

        if ($dryRun) {
            $this->warn("Dry-run finished. No records were written to the database.");
            return Command::SUCCESS;
        }

        // Ensure categories exist in DB
        foreach ($rowsToProcess as $item) {
            $cName = $item['cat'];
            $cLower = strtolower($cName);
            if (!isset($allCategories[$cLower])) {
                $newId = DB::table('categories')->insertGetId([
                    'category_name'          => $cName,
                    'description'            => "Description for {$cName}",
                    'is_enabled'             => 1,
                    'background_color'       => '#48AAD9',
                    'font_color'             => '#FFFFFF',
                    'hero_title'             => 'Product Recommendations',
                    'hero_subtitle_template' => 'Recommended products for you',
                    'created_at'             => now(),
                    'updated_at'             => now(),
                ]);
                $allCategories[$cLower] = (object) ['id' => $newId, 'category_name' => $cName];
            }

            $catId = $allCategories[$cLower]->id;
            DB::table('pharmacy_categories')->updateOrInsert(
                ['pharmacy_id' => $pharmacyId, 'category_id' => $catId],
                ['is_enabled' => true, 'updated_at' => now(), 'created_at' => now()]
            );
        }

        if ($fresh) {
            $this->warn("Clearing existing products for Pharmacy ID {$pharmacyId}...");
            $ppIds = DB::table('pharmacy_products')->where('pharmacy_id', $pharmacyId)->pluck('id');
            if ($ppIds->isNotEmpty()) {
                DB::table('product_batches')->whereIn('pharmacy_product_id', $ppIds)->delete();
                DB::table('inventory_logs')->whereIn('pharmacy_product_id', $ppIds)->delete();
                DB::table('pharmacy_products')->whereIn('id', $ppIds)->delete();
                DB::table('products')->where('pharmacy_id', $pharmacyId)->delete();
            }
        }

        $driver = DB::getDriverName();
        if ($driver !== 'sqlite') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        }

        $now = now();
        $importedCount = 0;

        $bar = $this->output->createProgressBar($totalItems);
        $bar->start();

        foreach (array_chunk($rowsToProcess, 200) as $chunk) {
            DB::transaction(function () use ($chunk, $pharmacyId, $allCategories, $now, &$importedCount, $bar) {
                foreach ($chunk as $row) {
                    $catId = $allCategories[strtolower($row['cat'])]->id;
                    $isMedicine = in_array(strtolower($row['cat']), ['branded', 'generic', 'injectables/vial', 'eye med'], true);
                    $productType = $isMedicine ? 'medicine' : 'non-medicine';

                    // 1. Create/Update Product
                    $productId = DB::table('products')->insertGetId([
                        'pharmacy_id'   => $pharmacyId,
                        'product_type'  => $productType,
                        'product_name'  => $row['name'],
                        'generic_name'  => strtolower($row['cat']) === 'generic' ? $row['name'] : null,
                        'brand_name'    => strtolower($row['cat']) === 'branded' ? $row['name'] : null,
                        'description'   => null,
                        'form'          => null,
                        'strength'      => null,
                        'size'          => null,
                        'is_prescribed' => strtolower($row['cat']) === 'injectables/vial' ? 1 : 0,
                        'image_path'    => null,
                        'created_at'    => $now,
                        'updated_at'    => $now,
                    ]);

                    // 2. Create PharmacyProduct (Inventory)
                    $ppId = DB::table('pharmacy_products')->insertGetId([
                        'pharmacy_id'     => $pharmacyId,
                        'product_id'      => $productId,
                        'category_id'     => $catId,
                        'stock'           => $row['stock'],
                        'unit_cost'       => $row['cost'],
                        'selling_price'   => $row['price'],
                        'is_discountable' => 1,
                        'is_available'    => $row['stock'] > 0 ? 1 : 0,
                        'is_out_of_stock' => $row['stock'] == 0 ? 1 : 0,
                        'is_expired'      => 0,
                        'lead_time_days'  => 3,
                        'ordered_at'      => null,
                        'created_at'      => $now,
                        'updated_at'      => $now,
                    ]);

                    // 3. Create ProductBatch (batch_number = null, expiry_date = null)
                    DB::table('product_batches')->insert([
                        'pharmacy_product_id' => $ppId,
                        'batch_number'        => null,
                        'supplier_name'       => null,
                        'stock'               => $row['stock'],
                        'expiry_date'         => null,
                        'manufactured_date'   => null,
                        'received_at'         => $now,
                        'created_at'          => $now,
                        'updated_at'          => $now,
                    ]);

                    $importedCount++;
                    $bar->advance();
                }
            });
        }

        $bar->finish();
        $this->newLine(2);

        if ($driver !== 'sqlite') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        $this->info("Import completed successfully for {$pharmacy->pharmacy_name} (ID: {$pharmacyId})!");
        $this->info("Total products imported: {$importedCount}");

        return Command::SUCCESS;
    }
}
