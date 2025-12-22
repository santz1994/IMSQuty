<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'message' => fake()->paragraph(),
            'type' => fake()->randomElement(['Info', 'Warning', 'Error', 'Success']),
            'channel' => fake()->randomElement(['email', 'sms', 'push', 'database']),
            'priority' => fake()->randomElement(['Urgent', 'High', 'Normal', 'Low']),
            'status' => 'Pending',
            'recipient_id' => User::factory(),
            'recipient_email' => fake()->email(),
            'recipient_phone' => fake()->phoneNumber(),
            'is_read' => false,
            'read_at' => null,
            'sent_at' => null,
            'failed_at' => null,
            'error_message' => null,
            'metadata' => null
        ];
    }

    public function sent(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Sent',
            'sent_at' => now()
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Pending',
            'sent_at' => null
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'Failed',
            'failed_at' => now(),
            'error_message' => 'Test error message'
        ]);
    }

    public function unread(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => false,
            'read_at' => null
        ]);
    }

    public function read(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_read' => true,
            'read_at' => now()
        ]);
    }

    public function urgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => 'Urgent'
        ]);
    }
}
