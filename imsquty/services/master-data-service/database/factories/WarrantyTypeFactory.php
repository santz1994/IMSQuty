<?php

namespace Database\Factories;

use App\Models\WarrantyType;
use Illuminate\Database\Eloquent\Factories\Factory;

class WarrantyTypeFactory extends Factory
{
    protected $model = WarrantyType::class;

    public function definition(): array
    {
        $durations = [12, 24, 36, 48, 60];
        $duration = $this->faker->randomElement($durations);

        return [
            'name' => $duration . ' Month ' . $this->faker->randomElement(['Standard', 'Extended', 'Premium']) . ' Warranty',
            'duration_months' => $duration,
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
