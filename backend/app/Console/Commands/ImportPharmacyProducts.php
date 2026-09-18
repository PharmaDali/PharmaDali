<?php

namespace App\Console\Commands;

use Database\Seeders\PharmacyProductsImportSeeder;
use Illuminate\Console\Command;

class ImportPharmacyProducts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'pharmacy:import-products';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import exported pharmacy products, categories, inventory, and batches into the current environment';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        return $this->call('db:seed', [
            '--class' => PharmacyProductsImportSeeder::class,
        ]);
    }
}
