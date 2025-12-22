<?php

namespace Database\Factories;

use App\Models\Status;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Status Factory
 * 
 * Generates test data for Status model
 * 
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Status>
 */
class StatusFactory extends Factory
{
    protected $model = Status::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = [
            'Available',
            'Assigned',
            'In Maintenance',
            'Retired',
            'Broken',
            'Pending',
            'Active',
            'Inactive',
        ];

        return [
            'name' => fake()->randomElement($statuses),
        ];
    }

    /**
     * Create "Available" status
     */
    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Available',
        ]);
    }

    /**
     * Create "Assigned" status
     */
    public function assigned(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Assigned',
        ]);
    }

    /**
     * Create "In Maintenance" status
     */
    public function maintenance(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'In Maintenance',
        ]);
    }

    /**
     * Create "Retired" status
     */
    public function retired(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Retired',
        ]);
    }

    /**
     * Create "Broken" status
     */
    public function broken(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Broken',
        ]);
    }
}
