<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class ProductsSeeder extends Seeder
{
    /**
     * Scrape additional products from MedsGo across all active pharmacies.
     *
     * Usage:
     *   php artisan db:seed --class=ProductsSeeder
     *   or directly via:
     *   php artisan staging:scrape-medsgo --limit=100 --stock=100
     */
    public function run(): void
    {
        $limit = (int) env('MEDSGO_SCRAPE_LIMIT', 1200);
        $stock = (int) env('MEDSGO_SCRAPE_STOCK', 100);

        $this->command?->info("Scraping {$limit} additional MedsGo products across all active pharmacies...");

        Artisan::call('staging:scrape-medsgo', [
            '--limit' => $limit,
            '--stock' => $stock,
        ], $this->command?->getOutput());
    }
}
