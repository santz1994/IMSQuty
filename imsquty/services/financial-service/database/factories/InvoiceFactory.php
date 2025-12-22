<?php

namespace Database\Factories;

use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    public function definition(): array
    {
        return [
            'invoice_number' => 'INV-' . fake()->unique()->numberBetween(1000, 9999),
            'customer_name' => fake()->company(),
            'customer_email' => fake()->companyEmail(),
            'customer_phone' => fake()->phoneNumber(),
            'amount' => fake()->numberBetween(500000, 10000000),
            'tax' => fake()->numberBetween(50000, 1000000),
            'total' => fake()->numberBetween(550000, 11000000),
            'due_date' => fake()->dateTimeBetween('now', '+30 days'),
            'paid_date' => null,
            'status' => fake()->randomElement(['Draft', 'Pending', 'Paid']),
            'notes' => fake()->optional()->sentence(),
            'created_by' => 1,
            'updated_by' => 1
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Pending',
            'paid_date' => null
        ]);
    }

    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Paid',
            'paid_date' => now()
        ]);
    }

    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Overdue',
            'due_date' => now()->subDays(10)
        ]);
    }
}
