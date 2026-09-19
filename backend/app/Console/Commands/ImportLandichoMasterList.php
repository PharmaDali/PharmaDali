<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use App\Models\Products;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportLandichoMasterList extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pharmacy:import-landicho 
                            {--file= : Path to the Landicho Product Master List Excel file}
                            {--pharmacy_id=2 : The ID of the pharmacy to import into}
                            {--fresh : Clear existing products for this pharmacy before importing}
                            {--dry-run : Simulate the import without saving changes to the database}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import Landicho Drugstore Product Master List from Excel into the database';

    public function handle(): int
    {
        $pharmacyId = (int) $this->option('pharmacy_id');
        $dryRun = (bool) $this->option('dry-run');
        $fresh = (bool) $this->option('fresh');

        $pharmacy = Pharmacy::find($pharmacyId);
        if (!$pharmacy) {
            $this->error("Pharmacy with ID {$pharmacyId} not found.");
            return Command::FAILURE;
        }

        $filePath = $this->option('file') ?: base_path('../Landicho Product Master List.xlsx');
        if (!File::exists($filePath)) {
            // Try absolute path or workspace root
            $filePath = 'c:/Dev/PharmaDali/Landicho Product Master List.xlsx';
        }

        if (!File::exists($filePath)) {
            $this->error("Excel file not found at: {$filePath}");
            return Command::FAILURE;
        }

        $this->info("Loading Excel spreadsheet: {$filePath}");
        $spreadsheet = IOFactory::load($filePath);
        $sheet = $spreadsheet->getSheetByName('MASTER PRODUCT DATA') ?: $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray(null, true, true, false);

        if (empty($rows) || count($rows) < 2) {
            $this->error("The Excel sheet is empty or has no data rows.");
            return Command::FAILURE;
        }

        $headerRow = $rows[0];
        $headerMap = [];
        foreach ($headerRow as $idx => $colName) {
            if ($colName !== null) {
                $headerMap[trim((string) $colName)] = $idx;
            }
        }

        $this->info("Detected columns: " . implode(', ', array_keys($headerMap)));

        $dataRows = array_slice($rows, 1);
        $totalRows = count($dataRows);
        $this->info("Found {$totalRows} data rows to process for {$pharmacy->pharmacy_name} (ID: {$pharmacyId}).");

        if ($dryRun) {
            $this->warn("RUNNING IN DRY-RUN MODE — No changes will be saved to the database.");
        }

        // 1. Prepare Category Mapping
        // Excel category => Target DB Category Name
        $categoryNameMapping = [
            'GENERIC'       => 'Generic',
            'BRANDED'       => 'Branded',
            'INFANT'        => 'Infant',
            'VITAMINS'      => 'Vitamins',
            'EYE MED'       => 'Eye Med',
            'INJECTIBLES'   => 'Injectables',
            'CREAMS'        => 'Cream',
            'OINTMENT'      => 'CREAM/OINTMENT',
            'DIAPERS'       => 'Diapers',
            'COSMETICS'     => 'Cosmetics',
            'HYGIENE'       => 'Hygiene',
            'SANITARY'      => 'Sanitary',
            'MILK'          => 'Milk',
            'BEVERAGES'     => 'Drinks',
            'MEDICAL TOOLS' => 'SUPPLIES',
            'OTHERS'        => 'Others',
        ];

        // Specific default colors & descriptions for newly created categories
        $categoryDefaults = [
            'Others'   => ['bg' => '#6C757D', 'font' => '#FFFFFF', 'hero' => 'Daily Essentials & General Products'],
            'Sanitary' => ['bg' => '#E83E8C', 'font' => '#FFFFFF', 'hero' => 'Feminine & Sanitary Care Essentials'],
        ];

        $categoryDbMap = []; // 'UPPER_EXCEL_CAT' => DB Category Model
        foreach ($categoryNameMapping as $excelCat => $targetDbName) {
            $existing = DB::table('categories')
                ->whereRaw('LOWER(TRIM(category_name)) = ?', [strtolower($targetDbName)])
                ->first();

            if ($existing) {
                $categoryDbMap[strtoupper($excelCat)] = $existing;
            } else {
                if (!$dryRun) {
                    $defaults = $categoryDefaults[$targetDbName] ?? ['bg' => '#48AAD9', 'font' => '#FFFFFF', 'hero' => "{$targetDbName} Recommendations"];
                    $newId = DB::table('categories')->insertGetId([
                        'category_name'          => $targetDbName,
                        'description'            => "Description for {$targetDbName}",
                        'is_enabled'             => 1,
                        'background_color'       => $defaults['bg'],
                        'font_color'             => $defaults['font'],
                        'hero_title'             => $defaults['hero'],
                        'hero_subtitle_template' => "Recommended products for you in {$targetDbName}",
                        'created_at'             => now(),
                        'updated_at'             => now(),
                    ]);
                    $categoryDbMap[strtoupper($excelCat)] = DB::table('categories')->where('id', $newId)->first();
                    $this->info("Created new category: '{$targetDbName}' (ID: {$newId})");
                } else {
                    $categoryDbMap[strtoupper($excelCat)] = (object) ['id' => 9999, 'category_name' => $targetDbName];
                    $this->line("[Dry-Run] Would create new category: '{$targetDbName}'");
                }
            }
        }

        // Synchronize pharmacy_categories for Landicho Drugstore
        if (!$dryRun) {
            foreach ($categoryDbMap as $catObj) {
                DB::table('pharmacy_categories')->updateOrInsert(
                    ['pharmacy_id' => $pharmacyId, 'category_id' => $catObj->id],
                    ['is_enabled' => true, 'updated_at' => now(), 'created_at' => now()]
                );
            }
        }

        // 2. Process rows
        $createdCount = 0;
        $medicineCount = 0;
        $nonMedicineCount = 0;
        $skippedCount = 0;

        $catIdx       = $headerMap['CATEGORY'] ?? 0;
        $fullProdIdx  = $headerMap['Full Product Name'] ?? 1;
        $genericIdx   = $headerMap['Generic Name'] ?? 2;
        $prodNameIdx  = $headerMap['Product Name'] ?? 3;
        $dosageIdx    = $headerMap['Dosage'] ?? 5;
        $sizeIdx      = $headerMap['Size'] ?? 6;
        $formIdx      = $headerMap['Form (ex. capsule, syrup)'] ?? 8;
        $indIdx       = $headerMap['Indication'] ?? 9;
        $priceIdx     = $headerMap['Selling Price'] ?? 10;
        $rxIdx        = $headerMap['Needs Prescription (true or false)'] ?? 11;

        $productsData = [];
        $pharmacyProductsData = [];

        foreach ($dataRows as $rowNum => $row) {
            // Check if entire row is empty
            if (empty(array_filter($row, fn($v) => $v !== null && trim((string)$v) !== ''))) {
                continue;
            }

            $rawCat = trim((string)($row[$catIdx] ?? ''));
            $catUpper = strtoupper($rawCat);

            $categoryObj = $categoryDbMap[$catUpper] ?? null;
            if (!$categoryObj) {
                // Fallback: check DB directly
                $existing = DB::table('categories')->whereRaw('LOWER(TRIM(category_name)) = ?', [strtolower($rawCat)])->first();
                if ($existing) {
                    $categoryObj = $existing;
                } else {
                    $this->warn("Row " . ($rowNum + 2) . ": Unknown category '{$rawCat}', falling back to Others.");
                    $categoryObj = $categoryDbMap['OTHERS'] ?? (object)['id' => 19, 'category_name' => 'Others'];
                }
            }

            $isMedicine = in_array($catUpper, ['GENERIC', 'BRANDED'], true);
            $productType = $isMedicine ? 'medicine' : 'non-medicine';

            $prodNameInput = isset($row[$prodNameIdx]) ? trim((string)$row[$prodNameIdx]) : '';
            $fullProdInput = isset($row[$fullProdIdx]) ? trim((string)$row[$fullProdIdx]) : '';
            $genericInput  = isset($row[$genericIdx]) ? trim((string)$row[$genericIdx]) : '';
            $dosageInput   = isset($row[$dosageIdx]) && $row[$dosageIdx] !== null ? trim((string)$row[$dosageIdx]) : null;
            $sizeInput     = isset($row[$sizeIdx]) && $row[$sizeIdx] !== null ? trim((string)$row[$sizeIdx]) : null;
            $formInput     = isset($row[$formIdx]) && $row[$formIdx] !== null ? trim((string)$row[$formIdx]) : null;
            $indInput      = isset($row[$indIdx]) && $row[$indIdx] !== null ? trim((string)$row[$indIdx]) : null;
            $priceInput    = isset($row[$priceIdx]) ? $row[$priceIdx] : null;
            $rxInput       = isset($row[$rxIdx]) ? $row[$rxIdx] : null;

            // Clean empty strings to null
            $dosageInput = $dosageInput === '' ? null : $dosageInput;
            $sizeInput   = $sizeInput === '' ? null : $sizeInput;
            $formInput   = $formInput === '' ? null : $formInput;
            $indInput    = $indInput === '' ? null : $indInput;

            // Product Name and Brand Name resolution
            $productName = '';
            $brandName   = null;
            $genericName = $genericInput !== '' ? $genericInput : null;

            if ($isMedicine) {
                // User requirement: the brand_name field in the database is the Product Name in the excel file for generic and branded medicines.
                $brandName = $prodNameInput !== '' ? $prodNameInput : null;

                if ($catUpper === 'GENERIC') {
                    // For generic medicines, product_name is the Generic Name (fallback to Product Name if blank)
                    $productName = $genericInput !== '' ? $genericInput : $prodNameInput;
                } else {
                    // For branded medicines, product_name is the Product Name
                    $productName = $prodNameInput !== '' ? $prodNameInput : $genericInput;
                }
            } else {
                // Non-medicine categories:
                // If Full Product Name is provided, it contains the specific variant (e.g. "Juicy Cologne Sweet Delights")
                if ($fullProdInput !== '') {
                    $productName = $fullProdInput;
                    $brandName = $prodNameInput !== '' ? $prodNameInput : null;
                } elseif ($prodNameInput !== '') {
                    $productName = $prodNameInput;
                    $brandName = $prodNameInput;
                } else {
                    $productName = $genericInput !== '' ? $genericInput : 'Unnamed Product';
                }
            }

            if ($productName === '') {
                $this->warn("Row " . ($rowNum + 2) . ": Could not determine product name. Skipping.");
                $skippedCount++;
                continue;
            }

            // Selling Price
            $sellingPrice = 0.00;
            if ($priceInput !== null && trim((string)$priceInput) !== '') {
                $sellingPrice = round((float) $priceInput, 2);
            }

            // Needs prescription
            $isPrescribed = false;
            if ($rxInput !== null) {
                if (is_bool($rxInput)) {
                    $isPrescribed = $rxInput;
                } else {
                    $rxStr = strtolower(trim((string)$rxInput));
                    $isPrescribed = in_array($rxStr, ['1', 'true', 'yes'], true);
                }
            }

            if ($isMedicine) {
                $medicineCount++;
            } else {
                $nonMedicineCount++;
            }

            $productsData[] = [
                'pharmacy_id'    => $pharmacyId,
                'product_type'   => $productType,
                'product_name'   => $productName,
                'generic_name'   => $genericName,
                'brand_name'     => $brandName,
                'description'    => $indInput,
                'form'           => $formInput,
                'strength'       => $dosageInput,
                'size'           => $sizeInput,
                'is_prescribed'  => $isPrescribed,
                'image_path'     => null,
                'created_at'     => now(),
                'updated_at'     => now(),
                // Extra metadata for pharmacy_product
                '_category_id'   => $categoryObj->id,
                '_selling_price' => $sellingPrice,
                '_is_medicine'   => $isMedicine,
            ];
        }

        $this->info("Parsed successfully: " . count($productsData) . " valid products.");
        $this->line("  • Medicine (GENERIC & BRANDED): {$medicineCount}");
        $this->line("  • Non-Medicine: {$nonMedicineCount}");
        if ($skippedCount > 0) {
            $this->warn("  • Skipped: {$skippedCount}");
        }

        if ($dryRun) {
            $this->info("[Dry-Run] Completed simulation. No records were written.");
            return Command::SUCCESS;
        }

        if ($fresh) {
            $this->warn("Clearing previous products for Pharmacy ID {$pharmacyId}...");
            $oldPpIds = PharmacyProduct::where('pharmacy_id', $pharmacyId)->pluck('id');
            DB::table('product_batches')->whereIn('pharmacy_product_id', $oldPpIds)->delete();
            DB::table('inventory_logs')->whereIn('pharmacy_product_id', $oldPpIds)->delete();
            PharmacyProduct::where('pharmacy_id', $pharmacyId)->delete();
            Products::where('pharmacy_id', $pharmacyId)->delete();
            $this->info("Previous products cleared.");
        }

        // Insert records inside a database transaction without firing bulk websocket alerts
        $this->info("Writing products to database for Pharmacy ID {$pharmacyId}...");

        DB::transaction(function () use ($productsData, $pharmacyId, &$createdCount) {
            PharmacyProduct::withoutEvents(function () use ($productsData, $pharmacyId, &$createdCount) {
                Products::withoutEvents(function () use ($productsData, $pharmacyId, &$createdCount) {
                    foreach ($productsData as $p) {
                        $catId = $p['_category_id'];
                        $sellingPrice = $p['_selling_price'];
                        $isMedicine = $p['_is_medicine'];

                        unset($p['_category_id'], $p['_selling_price'], $p['_is_medicine']);

                        // Find existing product for this pharmacy or create new
                        $product = Products::where('pharmacy_id', $pharmacyId)
                            ->where('product_name', $p['product_name'])
                            ->where('brand_name', $p['brand_name'])
                            ->where('strength', $p['strength'])
                            ->where('form', $p['form'])
                            ->where('size', $p['size'])
                            ->first();

                        if (!$product) {
                            $product = Products::create($p);
                        } else {
                            $product->update($p);
                        }

                        // Create or update pharmacy_product entry
                        PharmacyProduct::updateOrCreate(
                            [
                                'pharmacy_id' => $pharmacyId,
                                'product_id'  => $product->id,
                            ],
                            [
                                'category_id'     => $catId,
                                'stock'           => 0,
                                'unit_cost'       => 0.00,
                                'selling_price'   => $sellingPrice,
                                'is_discountable' => $isMedicine, // true for Senior/PWD on medicines
                                'is_available'    => true,
                                'is_out_of_stock' => true,
                                'is_expired'      => false,
                                'lead_time_days'  => 5,
                                'ordered_at'      => null,
                            ]
                        );

                        $createdCount++;
                    }
                });
            });
        });

        $this->newLine();
        $this->info("SUCCESS: Successfully imported {$createdCount} products into {$pharmacy->pharmacy_name} (ID: {$pharmacyId})!");

        // Also export a synchronized JSON file so it can be deployed to production
        $this->info("Exporting synchronized JSON file for VPS deployment...");
        $this->call('pharmacy:export-products', [
            'pharmacy_id' => $pharmacyId,
        ]);

        return Command::SUCCESS;
    }
}
