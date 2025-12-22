<?php

namespace Database\Factories;

use App\Models\Division;
use Illuminate\Database\Eloquent\Factories\Factory;

class DivisionFactory extends Factory
{
    protected $model = Division::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['IT', 'Finance', 'HR', 'Operations', 'Sales']) . ' ' . $this->faker->randomElement(['Department', 'Division', 'Team']),
            'code' => strtoupper($this->faker->unique()->lexify('DIV???')),
            'description' => $this->faker->optional()->sentence(),
            'parent_id' => null,
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
