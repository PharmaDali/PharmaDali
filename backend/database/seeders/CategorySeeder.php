<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            "Branded",
            "Generic",
            "Injectables",
            "Eye Med ",
            "Cream",
            "Cosmetics",
            "Hygiene",
            "Diapers",
            "Infant",
            "Milk",
            "Drinks",
            "Vitamins"
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['category_name' => $category], [
                'description' => 'Description for ' . $category,
            ]);
        }
    }
}
