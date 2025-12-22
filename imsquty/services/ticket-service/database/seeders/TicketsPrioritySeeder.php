<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TicketsPriority;

class TicketsPrioritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $priorities = [
            ['priority' => 'Urgent', 'sla_hours' => 4, 'color' => '#dc3545', 'order' => 1, 'is_active' => true],
            ['priority' => 'High', 'sla_hours' => 24, 'color' => '#fd7e14', 'order' => 2, 'is_active' => true],
            ['priority' => 'Medium', 'sla_hours' => 72, 'color' => '#ffc107', 'order' => 3, 'is_active' => true],
            ['priority' => 'Low', 'sla_hours' => 168, 'color' => '#28a745', 'order' => 4, 'is_active' => true],
        ];

        foreach ($priorities as $priority) {
            TicketsPriority::firstOrCreate(
                ['priority' => $priority['priority']],
                $priority
            );
        }

        $this->command->info('✅ Ticket priorities seeded successfully!');
    }
}
