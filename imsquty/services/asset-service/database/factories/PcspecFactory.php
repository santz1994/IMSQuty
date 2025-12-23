<?php

namespace Database\Factories;

use App\Models\Pcspec;
use Illuminate\Database\Eloquent\Factories\Factory;

class PcspecFactory extends Factory
{
    protected $model = Pcspec::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'processor' => fake()->randomElement(['Intel i5-10210U', 'Intel i7-10510U', 'AMD Ryzen 5 4500U', 'M1', 'M2']),
            'memory_gb' => fake()->randomElement([4, 8, 16, 32]),
            'storage_gb' => fake()->randomElement([256, 512, 1024]),
            'storage_type' => fake()->randomElement(['SSD', 'HDD']),
            'gpu' => fake()->optional(0.7)->randomElement(['Intel UHD Graphics', 'NVIDIA GeForce GTX', 'AMD Radeon']),
            'display_size' => fake()->randomElement([13.3, 14.0, 15.6, 17.3]),
            'notes' => fake()->optional(0.5)->sentence(),
        ];
    }
}
