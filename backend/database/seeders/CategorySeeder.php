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
            'Branded'          => [
                'background_color'       => '#48AAD9',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Health & Recovery Recommendations',
                'hero_subtitle_template' => 'Since you recently bought {product_name}, check out these health essentials and recovery boosters',
            ],
            'Generic'          => [
                'background_color'       => '#01A768',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Health & Recovery Recommendations',
                'hero_subtitle_template' => 'Since you recently bought {product_name}, check out these health essentials and recovery boosters',
            ],
            'Injectables/Vial' => [
                'background_color'       => '#1B6CA8',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Health & Recovery Recommendations',
                'hero_subtitle_template' => 'Since you recently bought {product_name}, check out these health essentials and recovery boosters',
            ],
            'Injectables'      => [
                'background_color'       => '#1B6CA8',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Health & Recovery Recommendations',
                'hero_subtitle_template' => 'Since you recently bought {product_name}, check out these health essentials and recovery boosters',
            ],
            'Eye Med'          => [
                'background_color'       => '#67A1B4',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Health & Recovery Recommendations',
                'hero_subtitle_template' => 'Since you recently bought {product_name}, check out these health essentials and recovery boosters',
            ],
            'Cream'            => [
                'background_color'       => '#B059D0',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Personal Care & Hygiene Essentials',
                'hero_subtitle_template' => 'Complement your purchase of {product_name} with these daily personal care and grooming items',
            ],
            'Cosmetics'        => [
                'background_color'       => '#F2577C',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Personal Care & Hygiene Essentials',
                'hero_subtitle_template' => 'Complement your purchase of {product_name} with these daily personal care and grooming items',
            ],
            'Hygiene'          => [
                'background_color'       => '#31C0B3',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Personal Care & Hygiene Essentials',
                'hero_subtitle_template' => 'Complement your purchase of {product_name} with these daily personal care and grooming items',
            ],
            'Diapers'          => [
                'background_color'       => '#72AAD9',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Baby & Child Care Essentials',
                'hero_subtitle_template' => 'Based on your purchase of {product_name}, here are recommended diapers, formulas, and baby care items',
            ],
            'Infant'           => [
                'background_color'       => '#FB8A79',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Baby & Child Care Essentials',
                'hero_subtitle_template' => 'Based on your purchase of {product_name}, here are recommended diapers, formulas, and baby care items',
            ],
            'Milk'             => [
                'background_color'       => '#DAB55A',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Baby & Child Care Essentials',
                'hero_subtitle_template' => 'Based on your purchase of {product_name}, here are recommended diapers, formulas, and baby care items',
            ],
            'Drinks'           => [
                'background_color'       => '#F2994A',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Health & Recovery Recommendations',
                'hero_subtitle_template' => 'Since you recently bought {product_name}, check out these health essentials and recovery boosters',
            ],
            'Vitamins'         => [
                'background_color'       => '#E2B019',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Immunity & Daily Wellness',
                'hero_subtitle_template' => 'Since you recently bought {product_name}, check out these top vitamins and daily health boosters',
            ],
            'Supplies'         => [
                'background_color'       => '#48AAD9',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'First Aid & Medical Supplies',
                'hero_subtitle_template' => 'Since you bought {product_name}, keep your home prepared with these essential medical supplies',
            ],
            'CREAM/OINTMENT'   => [
                'background_color'       => '#B059D0',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Personal Care & Hygiene Essentials',
                'hero_subtitle_template' => 'Complement your purchase of {product_name} with these daily personal care and grooming items',
            ],
            'Sanitary'         => [
                'background_color'       => '#E83E8C',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Feminine & Sanitary Care Essentials',
                'hero_subtitle_template' => 'Recommended products for you in Sanitary',
            ],
            'Others'           => [
                'background_color'       => '#6C757D',
                'font_color'             => '#FFFFFF',
                'hero_title'             => 'Daily Essentials & General Products',
                'hero_subtitle_template' => 'Recommended products for you in Others',
            ],
        ];

        foreach ($categories as $name => $data) {
            Category::updateOrCreate(
                ['category_name' => $name],
                [
                    'description'            => 'Description for ' . $name,
                    'is_enabled'             => true,
                    'background_color'       => $data['background_color'],
                    'font_color'             => $data['font_color'],
                    'hero_title'             => $data['hero_title'],
                    'hero_subtitle_template' => $data['hero_subtitle_template'],
                ]
            );
        }
    }
}
