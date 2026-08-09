<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Maps exact brand color tokens from the Customer App (ProductImage.jsx & CategoryUtils).
     */
    public function run(): void
    {
        $categories = [
            'Branded'          => ['background_color' => '#48AAD9', 'font_color' => '#FFFFFF'],
            'Generic'          => ['background_color' => '#01A768', 'font_color' => '#FFFFFF'],
            'Injectables/Vial' => ['background_color' => '#1B6CA8', 'font_color' => '#FFFFFF'],
            'Injectables'      => ['background_color' => '#1B6CA8', 'font_color' => '#FFFFFF'],
            'Eye Med'          => ['background_color' => '#67A1B4', 'font_color' => '#FFFFFF'],
            'Cream'            => ['background_color' => '#B059D0', 'font_color' => '#FFFFFF'],
            'Cosmetics'        => ['background_color' => '#F2577C', 'font_color' => '#FFFFFF'],
            'Hygiene'          => ['background_color' => '#31C0B3', 'font_color' => '#FFFFFF'],
            'Diapers'          => ['background_color' => '#72AAD9', 'font_color' => '#FFFFFF'],
            'Infant'           => ['background_color' => '#FB8A79', 'font_color' => '#FFFFFF'],
            'Milk'             => ['background_color' => '#DAB55A', 'font_color' => '#FFFFFF'],
            'Drinks'           => ['background_color' => '#F2994A', 'font_color' => '#FFFFFF'],
            'Vitamins'         => ['background_color' => '#E2B019', 'font_color' => '#FFFFFF'],
            'Supplies'         => ['background_color' => '#48AAD9', 'font_color' => '#FFFFFF'],
        ];

        foreach ($categories as $name => $colors) {
            Category::updateOrCreate(
                ['category_name' => $name],
                [
                    'description'      => 'Description for ' . $name,
                    'is_enabled'       => true,
                    'background_color' => $colors['background_color'],
                    'font_color'       => $colors['font_color'],
                ]
            );
        }
    }
}
