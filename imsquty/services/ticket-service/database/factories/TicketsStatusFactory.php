<?php

namespace Database\Factories;

use App\Models\TicketsStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketsStatus>
 */
class TicketsStatusFactory extends Factory
{
    protected $model = TicketsStatus::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = [
            ['status' => 'New', 'color' => '#FFA500'],
            ['status' => 'Open', 'color' => '#0000FF'],
            ['status' => 'In Progress', 'color' => '#FFFF00'],
            ['status' => 'Resolved', 'color' => '#00FF00'],
            ['status' => 'Closed', 'color' => '#808080'],
        ];

        $status = $this->faker->randomElement($statuses);

        return [
            'status' => $status['status'],
            'color' => $status['color'],
            'description' => 'Ticket is ' . strtolower($status['status']),
        ];
    }
}
