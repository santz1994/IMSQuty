<?php

namespace Database\Factories;

use App\Models\Manufacturer;
use Illuminate\Database\Eloquent\Factories\Factory;

class ManufacturerFactory extends Factory
{
    protected $model = Manufacturer::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'country' => fake()->country(),
            'contact_email' => fake()->companyEmail(),
            'notes' => fake()->optional(0.5)->sentence(),
        ];
    }
}
