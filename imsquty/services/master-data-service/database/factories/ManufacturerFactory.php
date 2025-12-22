<?php

namespace Database\Factories;

use App\Models\Manufacturer;
use Illuminate\Database\Eloquent\Factories\Factory;

class ManufacturerFactory extends Factory
{
    protected $model = Manufacturer::class;

    public function definition(): array
    {
        $companies = ['Dell', 'HP', 'Lenovo', 'Acer', 'Asus', 'Apple', 'Microsoft', 'Samsung'];
        $company = $this->faker->randomElement($companies);

        return [
            'name' => $company . ' ' . $this->faker->randomElement(['Inc', 'Corporation', 'Technologies']),
            'code' => strtoupper($this->faker->unique()->lexify('MFG???')),
            'website' => $this->faker->url(),
            'support_email' => 'support@' . strtolower($company) . '.com',
            'support_phone' => $this->faker->phoneNumber(),
            'description' => $this->faker->optional()->sentence(),
            'is_active' => $this->faker->boolean(90),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
