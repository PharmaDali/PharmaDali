<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ExportPharmacyProducts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pharmacy:export-products 
                            {pharmacy_id=1 : The ID of the pharmacy to export products for}
                            {--without-images : Omit product image paths and set them to null}
                            {--output= : Custom file path for the exported JSON}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export all products, categories, pharmacy products, and batches for a pharmacy to a JSON file';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $pharmacyId = (int) $this->argument('pharmacy_id');

        $pharmacy = DB::table('pharmacies')->where('id', $pharmacyId)->first();
        if (!$pharmacy) {
            $this->error("Pharmacy with ID {$pharmacyId} not found in database.");
            return Command::FAILURE;
        }

        $this->info("Exporting data for pharmacy: {$pharmacy->pharmacy_name} (ID: {$pharmacyId})...");

        // 1. Fetch pharmacy_products
        $pharmacyProducts = DB::table('pharmacy_products')
            ->where('pharmacy_id', $pharmacyId)
            ->get()
            ->map(fn ($item) => (array) $item)
            ->toArray();

        $pharmacyProductIds = array_column($pharmacyProducts, 'id');
        $productIds = array_unique(array_column($pharmacyProducts, 'product_id'));
        $categoryIds = array_unique(array_filter(array_column($pharmacyProducts, 'category_id')));

        $withoutImages = (bool) $this->option('without-images');

        // 2. Fetch products
        $products = DB::table('products')
            ->whereIn('id', $productIds)
            ->get()
            ->map(function ($item) use ($withoutImages) {
                $arr = (array) $item;
                if ($withoutImages) {
                    $arr['image_path'] = null;
                }
                return $arr;
            })
            ->toArray();

        // 3. Fetch referenced categories
        $categories = DB::table('categories')
            ->whereIn('id', $categoryIds)
            ->get()
            ->map(fn ($item) => (array) $item)
            ->toArray();

        // Map category ID to name for resilient cross-environment import
        $categoryNameMap = [];
        foreach ($categories as $cat) {
            $categoryNameMap[$cat['id']] = $cat['category_name'];
        }

        foreach ($pharmacyProducts as &$pp) {
            $pp['category_name'] = $categoryNameMap[$pp['category_id']] ?? null;
        }
        unset($pp);

        // 4. Fetch product batches
        $batches = [];
        if (!empty($pharmacyProductIds)) {
            $batches = DB::table('product_batches')
                ->whereIn('pharmacy_product_id', $pharmacyProductIds)
                ->get()
                ->map(fn ($item) => (array) $item)
                ->toArray();
        }

        // 5. Check for image files
        $images = [];
        if (!$withoutImages) {
            foreach ($products as $p) {
                if (!empty($p['image_path'])) {
                    $images[] = $p['image_path'];
                }
            }
        }

        $payload = [
            'exported_at'       => now()->toIso8601String(),
            'pharmacy'          => (array) $pharmacy,
            'category_count'    => count($categories),
            'categories'        => $categories,
            'product_count'     => count($products),
            'products'          => $products,
            'pharmacy_product_count' => count($pharmacyProducts),
            'pharmacy_products' => $pharmacyProducts,
            'batch_count'       => count($batches),
            'batches'           => $batches,
            'image_paths'       => $images,
        ];

        // Determine destination
        $outputOption = $this->option('output');
        $outputPath = $outputOption 
            ? base_path($outputOption) 
            : database_path("seeders/data/pharmacy_{$pharmacyId}_products.json");

        $dir = dirname($outputPath);
        if (!File::isDirectory($dir)) {
            File::makeDirectory($dir, 0755, true);
        }

        File::put($outputPath, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

        $this->newLine();
        $this->info("Successfully exported data to: {$outputPath}");
        $this->table(
            ['Entity', 'Count'],
            [
                ['Categories', count($categories)],
                ['Base Products', count($products)],
                ['Pharmacy Products (Inventory)', count($pharmacyProducts)],
                ['Product Batches', count($batches)],
                ['Products with Images', count($images)],
            ]
        );

        if (!empty($images)) {
            $this->newLine();
            $this->comment("Products with images detected (" . count($images) . "):");
            foreach ($images as $img) {
                $this->line("  - storage/app/public/{$img}");
            }
            $this->comment("Make sure to copy these image files to production under storage/app/public/products/.");
        }

        return Command::SUCCESS;
    }
}
