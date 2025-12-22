<?php

namespace Database\Factories;

use App\Models\Budget;
use Illuminate\Database\Eloquent\Factories\Factory;

class BudgetFactory extends Factory
{
    protected $model = Budget::class;

    public function definition(): array
    {
        $allocated = fake()->numberBetween(10000000, 100000000);
        $spent = fake()->numberBetween(0, $allocated);

        return [
            'name' => fake()->words(3, true) . ' Budget',
            'category' => fake()->randomElement(['IT', 'HR', 'Marketing', 'Operations', 'R&D']),
            'allocated_amount' => $allocated,
            'spent_amount' => $spent,
            'period_start' => now()->startOfYear(),
            'period_end' => now()->endOfYear(),
            'is_active' => true,
            'created_by' => 1,
            'updated_by' => 1
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true
        ]);
    }
}
