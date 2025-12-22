<?php

namespace Database\Factories;

use App\Models\TicketsPriority;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketsPriority>
 */
class TicketsPriorityFactory extends Factory
{
    protected $model = TicketsPriority::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $priorities = [
            ['priority' => 'Critical', 'sla_hours' => 2, 'color' => '#FF0000'],
            ['priority' => 'High', 'sla_hours' => 4, 'color' => '#FF6600'],
            ['priority' => 'Medium', 'sla_hours' => 24, 'color' => '#FFFF00'],
            ['priority' => 'Low', 'sla_hours' => 72, 'color' => '#00FF00'],
        ];

        $priority = $this->faker->randomElement($priorities);

        return [
            'priority' => $priority['priority'],
            'sla_hours' => $priority['sla_hours'],
            'color' => $priority['color'],
            'description' => $priority['priority'] . ' priority ticket',
        ];
    }
}
