<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Products>
 */
class ProductsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $medicines = [
            [
                'product_name' => 'Biogesic',
                'generic_name' => 'Paracetamol',
                'brand_name' => 'Unilab',
                'form' => 'tablet',
                'strength' => '500mg',
            ],
            [
                'product_name' => 'Medicol',
                'generic_name' => 'Ibuprofen',
                'brand_name' => 'United Laboratories',
                'form' => 'capsule',
                'strength' => '200mg',
            ],
            [
                'product_name' => 'Neozep',
                'generic_name' => 'Phenylephrine + Chlorphenamine + Paracetamol',
                'brand_name' => 'Unilab',
                'form' => 'tablet',
                'strength' => '500mg',
            ],
            [
                'product_name' => 'Tempra',
                'generic_name' => 'Paracetamol',
                'brand_name' => 'Taisho',
                'form' => 'syrup',
                'strength' => '250mg/5mL',
            ],
            [
                'product_name' => 'Solmux',
                'generic_name' => 'Carbocisteine',
                'brand_name' => 'Unilab',
                'form' => 'syrup',
                'strength' => '500mg',
            ],
            [
                'product_name' => 'Diatabs',
                'generic_name' => 'Loperamide',
                'brand_name' => 'Johnson & Johnson',
                'form' => 'capsule',
                'strength' => '2mg',
            ],
            [
                'product_name' => 'Kremil-S',
                'generic_name' => 'Aluminum Hydroxide + Magnesium Hydroxide + Simethicone',
                'brand_name' => 'Unilab',
                'form' => 'tablet',
                'strength' => '178mg',
            ],
            [
                'product_name' => 'Ascof',
                'generic_name' => 'Lagundi',
                'brand_name' => 'Pascual',
                'form' => 'syrup',
                'strength' => '300mg',
            ],
            [
                'product_name' => 'Amoxil',
                'generic_name' => 'Amoxicillin',
                'brand_name' => 'GSK',
                'form' => 'capsule',
                'strength' => '500mg',
            ],
            [
                'product_name' => 'Zyrtec',
                'generic_name' => 'Cetirizine',
                'brand_name' => 'Johnson & Johnson',
                'form' => 'tablet',
                'strength' => '10mg',
            ],
            [
                'product_name' => 'Decolgen',
                'generic_name' => 'Phenylephrine + Chlorphenamine + Paracetamol',
                'brand_name' => 'United Laboratories',
                'form' => 'tablet',
                'strength' => '500mg',
            ],
            [
                'product_name' => 'Buscopan',
                'generic_name' => 'Hyoscine-N-Butylbromide',
                'brand_name' => 'Boehringer',
                'form' => 'tablet',
                'strength' => '10mg',
            ],
            [
                'product_name' => 'Imodium',
                'generic_name' => 'Loperamide',
                'brand_name' => 'Johnson & Johnson',
                'form' => 'capsule',
                'strength' => '2mg',
            ],
            [
                'product_name' => 'Mefenamic',
                'generic_name' => 'Mefenamic Acid',
                'brand_name' => 'Generic Pharma',
                'form' => 'capsule',
                'strength' => '500mg',
            ],
            [
                'product_name' => 'Losartan',
                'generic_name' => 'Losartan Potassium',
                'brand_name' => 'Generic Pharma',
                'form' => 'tablet',
                'strength' => '50mg',
            ],
        ];

        $medicine = $this->faker->randomElement($medicines);

        return [
            'product_name' => $medicine['product_name'],
            'generic_name' => $medicine['generic_name'],
            'brand_name' => $medicine['brand_name'],
            'description' => $this->faker->sentence(),
            'form' => $medicine['form'],
            'strength' => $medicine['strength'],
            'category_id' => \App\Models\Category::factory(),
        ];
    }
}
