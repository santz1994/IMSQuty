<?php

namespace Database\Factories;

use App\Models\ReportSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReportScheduleFactory extends Factory
{
    protected $model = ReportSchedule::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true) . ' Schedule',
            'report_type' => fake()->randomElement(['Asset', 'Ticket', 'Financial', 'Inventory', 'User']),
            'frequency' => fake()->randomElement(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly']),
            'parameters' => ['include_all' => true],
            'format' => fake()->randomElement(['PDF', 'Excel', 'CSV']),
            'recipients' => [fake()->email(), fake()->email()],
            'is_active' => true,
            'last_run_at' => null,
            'next_run_at' => now()->addDay(),
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

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false
        ]);
    }

    public function dueForExecution(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
            'next_run_at' => now()->subHour()
        ]);
    }

    public function daily(): static
    {
        return $this->state(fn (array $attributes) => [
            'frequency' => 'Daily',
            'next_run_at' => now()->addDay()
        ]);
    }

    public function weekly(): static
    {
        return $this->state(fn (array $attributes) => [
            'frequency' => 'Weekly',
            'next_run_at' => now()->addWeek()
        ]);
    }
}
