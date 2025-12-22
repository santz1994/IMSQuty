<?php

namespace Database\Factories;

use App\Models\Expense;
use App\Models\Budget;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        return [
            'budget_id' => Budget::factory(),
            'description' => fake()->sentence(),
            'category' => fake()->randomElement(['Supplies', 'Equipment', 'Travel', 'Utilities', 'Services']),
            'amount' => fake()->numberBetween(100000, 5000000),
            'expense_date' => fake()->dateTimeBetween('-30 days', 'now'),
            'status' => fake()->randomElement(['Pending', 'Approved', 'Rejected', 'Paid']),
            'approved_by' => null,
            'approved_at' => null,
            'paid_date' => null,
            'notes' => fake()->optional()->sentence(),
            'created_by' => 1,
            'updated_by' => 1
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Pending'
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Approved',
            'approved_by' => 1,
            'approved_at' => now()
        ]);
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Paid',
            'approved_by' => 1,
            'approved_at' => now()->subDays(5),
            'paid_date' => now()
        ]);
    }
}
