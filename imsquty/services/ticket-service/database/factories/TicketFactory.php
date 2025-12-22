<?php

namespace Database\Factories;

use App\Models\Ticket;
use App\Models\User;
use App\Models\Location;
use App\Models\TicketsStatus;
use App\Models\TicketsPriority;
use App\Models\TicketsType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ticket>
 */
class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ticket_code' => 'TKT-' . now()->format('Ymd') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT),
            'user_id' => User::factory(),
            'location_id' => Location::factory(),
            'ticket_status_id' => TicketsStatus::factory(),
            'ticket_type_id' => TicketsType::factory(),
            'ticket_priority_id' => TicketsPriority::factory(),
            'subject' => $this->faker->sentence(6),
            'description' => $this->faker->paragraph(3),
            'assigned_to' => null,
            'assigned_at' => null,
            'assignment_type' => 'manual',
            'sla_due' => now()->addHours(4),
            'first_response_at' => null,
            'resolved_at' => null,
            'closed' => null,
            'is_breached' => false,
            'asset_id' => null,
        ];
    }

    /**
     * Indicate that the ticket is assigned.
     */
    public function assigned(): static
    {
        return $this->state(fn (array $attributes) => [
            'assigned_to' => User::factory(),
            'assigned_at' => now(),
            'assignment_type' => 'manual',
        ]);
    }

    /**
     * Indicate that the ticket is breached SLA.
     */
    public function breached(): static
    {
        return $this->state(fn (array $attributes) => [
            'sla_due' => now()->subHours(2),
            'is_breached' => true,
        ]);
    }

    /**
     * Indicate that the ticket is resolved.
     */
    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => [
            'resolved_at' => now()->subHours(1),
        ]);
    }

    /**
     * Indicate that the ticket is closed.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'resolved_at' => now()->subHours(2),
            'closed' => now()->subHours(1),
        ]);
    }
}
