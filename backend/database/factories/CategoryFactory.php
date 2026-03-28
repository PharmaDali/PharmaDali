<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            "Prescription Medicines",
            "Over-the-Counter (OTC) Medicines",
            "Vitamins and Supplements",
            "Baby and Kids",
            "Personal Care",
            "Medical Supplies",
            "Chronic Care",
            "Mother and Reproductive Health"
        ];

        return [
            'category_name' => $this->faker->randomElement($categories),
            'description' => $this->faker->sentence(),
        ];
    }
}
