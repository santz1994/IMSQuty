<?php

namespace Database\Factories;

use App\Models\MeetingRoom;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MeetingRoomBooking>
 */
class MeetingRoomBookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startTime = Carbon::now()->addDays(fake()->numberBetween(1, 30))->setTime(fake()->numberBetween(8, 17), 0);
        $endTime = $startTime->copy()->addHours(fake()->numberBetween(1, 4));

        return [
            'meeting_room_id' => MeetingRoom::factory(),
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'purpose' => fake()->optional()->sentence(),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'attendees_count' => fake()->numberBetween(2, 20),
            'attendees_list' => json_encode([
                fake()->name(),
                fake()->name(),
                fake()->name(),
            ]),
            'special_requirements' => fake()->optional()->sentence(),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected', 'cancelled', 'completed']),
            'approved_by' => null,
            'approved_at' => null,
            'rejection_reason' => null,
            'cancellation_reason' => null,
            'cancelled_at' => null,
        ];
    }

    /**
     * Indicate that the booking is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
        ]);
    }

    /**
     * Indicate that the booking is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'approved_by' => User::factory(),
            'approved_at' => Carbon::now(),
        ]);
    }

    /**
     * Indicate that the booking is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'rejection_reason' => fake()->sentence(),
        ]);
    }

    /**
     * Indicate that the booking is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'cancellation_reason' => fake()->sentence(),
            'cancelled_at' => Carbon::now(),
        ]);
    }
}
