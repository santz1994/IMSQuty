<?php

namespace Database\Factories;

use App\Models\Movement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Movement Factory
 * 
 * Generates test data for Movement model (asset transfers)
 * 
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Movement>
 */
class MovementFactory extends Factory
{
    protected $model = Movement::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $movementDate = fake()->dateTimeBetween('-2 years', 'now');

        return [
            'asset_id' => 1, // Will be set via relationships
            'from_location_id' => fake()->optional(0.8)->numberBetween(1, 20),
            'to_location_id' => fake()->optional(0.8)->numberBetween(1, 20),
            'from_user_id' => fake()->optional(0.6)->numberBetween(1, 50),
            'to_user_id' => fake()->optional(0.6)->numberBetween(1, 50),
            'movement_date' => $movementDate,
            'reason' => fake()->randomElement([
                'Employee relocation',
                'Office reorganization',
                'Equipment upgrade',
                'Maintenance required',
                'Department transfer',
                'New employee assignment',
                'Employee departure',
                'Storage relocation',
                'Project assignment',
                'Temporary loan',
            ]),
            'notes' => fake()->optional(0.4)->sentence(),
            'approved_by' => fake()->optional(0.7)->numberBetween(1, 10), // Assuming 10 managers
            'approved_at' => fake()->optional(0.7)->dateTimeBetween($movementDate, 'now'),
        ];
    }

    /**
     * Indicate location-only transfer (no user change)
     */
    public function locationTransfer(): static
    {
        return $this->state(fn (array $attributes) => [
            'from_location_id' => fake()->numberBetween(1, 20),
            'to_location_id' => fake()->numberBetween(1, 20),
            'from_user_id' => null,
            'to_user_id' => null,
            'reason' => fake()->randomElement([
                'Office reorganization',
                'Storage relocation',
                'Building move',
                'Department expansion',
            ]),
        ]);
    }

    /**
     * Indicate user-only transfer (same location)
     */
    public function userTransfer(): static
    {
        $locationId = fake()->numberBetween(1, 20);

        return $this->state(fn (array $attributes) => [
            'from_location_id' => $locationId,
            'to_location_id' => $locationId, // Same location
            'from_user_id' => fake()->numberBetween(1, 50),
            'to_user_id' => fake()->numberBetween(1, 50),
            'reason' => fake()->randomElement([
                'Employee relocation',
                'New employee assignment',
                'Project assignment',
                'Temporary loan',
            ]),
        ]);
    }

    /**
     * Indicate both location and user transfer
     */
    public function fullTransfer(): static
    {
        return $this->state(fn (array $attributes) => [
            'from_location_id' => fake()->numberBetween(1, 20),
            'to_location_id' => fake()->numberBetween(1, 20),
            'from_user_id' => fake()->numberBetween(1, 50),
            'to_user_id' => fake()->numberBetween(1, 50),
            'reason' => fake()->randomElement([
                'Department transfer',
                'Office relocation',
                'Employee relocation',
            ]),
        ]);
    }

    /**
     * Indicate approved transfer
     */
    public function approved(): static
    {
        $movementDate = fake()->dateTimeBetween('-2 years', 'now');

        return $this->state(fn (array $attributes) => [
            'approved_by' => fake()->numberBetween(1, 10),
            'approved_at' => fake()->dateTimeBetween($movementDate, 'now'),
        ]);
    }

    /**
     * Indicate pending approval transfer
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'approved_by' => null,
            'approved_at' => null,
        ]);
    }

    /**
     * Indicate recent transfer (within last 30 days)
     */
    public function recent(): static
    {
        return $this->state(fn (array $attributes) => [
            'movement_date' => fake()->dateTimeBetween('-30 days', 'now'),
        ]);
    }

    /**
     * Indicate historical transfer (over 1 year ago)
     */
    public function historical(): static
    {
        return $this->state(fn (array $attributes) => [
            'movement_date' => fake()->dateTimeBetween('-5 years', '-1 year'),
        ]);
    }

    /**
     * New employee assignment
     */
    public function newAssignment(): static
    {
        return $this->state(fn (array $attributes) => [
            'from_user_id' => null,
            'to_user_id' => fake()->numberBetween(1, 50),
            'reason' => 'New employee assignment',
        ]);
    }

    /**
     * Return to stock
     */
    public function returnToStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'from_user_id' => fake()->numberBetween(1, 50),
            'to_user_id' => null,
            'reason' => fake()->randomElement([
                'Employee departure',
                'Equipment return',
                'End of project',
            ]),
        ]);
    }
}
