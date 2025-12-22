<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TicketsStatus;

class TicketsStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            ['status' => 'New', 'color' => '#6c757d', 'order' => 1, 'is_active' => true],
            ['status' => 'Open', 'color' => '#17a2b8', 'order' => 2, 'is_active' => true],
            ['status' => 'In Progress', 'color' => '#ffc107', 'order' => 3, 'is_active' => true],
            ['status' => 'Resolved', 'color' => '#28a745', 'order' => 4, 'is_active' => true],
            ['status' => 'Closed', 'color' => '#343a40', 'order' => 5, 'is_active' => true],
        ];

        foreach ($statuses as $status) {
            TicketsStatus::firstOrCreate(
                ['status' => $status['status']],
                $status
            );
        }

        $this->command->info('✅ Ticket statuses seeded successfully!');
    }
}
