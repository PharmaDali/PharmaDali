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

        return [
            'category_name' => $this->faker->unique()->randomElement($categories),
            'description' => $this->faker->sentence(),
        ];
    }
}
