<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MeetingRoom>
 */
class MeetingRoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true) . ' Room',
            'code' => 'RM-' . fake()->unique()->numberBetween(1000, 9999),
            'location_id' => null,
            'floor' => fake()->numberBetween(1, 10),
            'building' => fake()->randomElement(['Main Building', 'Building A', 'Building B', 'Annex']),
            'capacity' => fake()->numberBetween(4, 50),
            'description' => fake()->sentence(),
            'facilities' => json_encode([
                fake()->randomElement(['Projector', 'Whiteboard', 'TV Screen']),
                fake()->randomElement(['Video Conference', 'Audio System', 'Microphone']),
            ]),
            'equipment' => json_encode([
                fake()->randomElement(['Laptop', 'Tablet', 'Presentation Clicker']),
                fake()->randomElement(['Conference Phone', 'Webcam', 'Document Camera']),
            ]),
            'hourly_rate' => fake()->randomFloat(2, 50, 500),
            'status' => fake()->randomElement(['available', 'maintenance', 'unavailable']),
            'image' => null,
            'notes' => fake()->optional()->sentence(),
        ];
    }
}
