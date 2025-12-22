<?php

namespace Database\Factories;

use App\Models\Report;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReportFactory extends Factory
{
    protected $model = Report::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true) . ' Report',
            'type' => fake()->randomElement(['Asset', 'Ticket', 'Financial', 'Inventory', 'User', 'Custom']),
            'description' => fake()->sentence(),
            'parameters' => [
                'date_from' => now()->subMonth()->toDateString(),
                'date_to' => now()->toDateString()
            ],
            'result_data' => null,
            'status' => fake()->randomElement(['Pending', 'Processing', 'Completed', 'Failed']),
            'generated_at' => null,
            'file_path' => null,
            'format' => fake()->randomElement(['PDF', 'Excel', 'CSV', 'JSON']),
            'created_by' => 1,
            'updated_by' => 1
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Completed',
            'generated_at' => now(),
            'file_path' => 'reports/' . fake()->uuid() . '.pdf',
            'result_data' => ['summary' => 'Report completed successfully']
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Pending',
            'generated_at' => null,
            'file_path' => null
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Failed',
            'result_data' => ['error' => 'Report generation failed']
        ]);
    }

    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Processing'
        ]);
    }
}
