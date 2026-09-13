<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DevelopmentSeeder extends Seeder
{
    /**
     * Run all seeders including mock data for local development and testing.
     *
     * Usage:
     *   php artisan db:seed --class=DevelopmentSeeder
     */
    public function run(): void
    {
        $this->call([
            DatabaseSeeder::class,
            PharmacySeeder::class,
            PharmacyAdminSeeder::class,
            ProductsSeeder::class,
            PharmacyProductSeeder::class,
            AnalyticsAndAprioriSeeder::class,
        ]);
    }
}

