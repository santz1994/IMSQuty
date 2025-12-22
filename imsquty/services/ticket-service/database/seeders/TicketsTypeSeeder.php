<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TicketsType;

class TicketsTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            ['type' => 'Hardware Issue', 'description' => 'Computer, printer, keyboard, mouse, monitor problems', 'is_active' => true],
            ['type' => 'Software Issue', 'description' => 'Application errors, software installation, updates', 'is_active' => true],
            ['type' => 'Network Issue', 'description' => 'Internet connectivity, WiFi, network access problems', 'is_active' => true],
            ['type' => 'Access Request', 'description' => 'System access, permission requests, account creation', 'is_active' => true],
            ['type' => 'Email Issue', 'description' => 'Email problems, Outlook issues, spam', 'is_active' => true],
            ['type' => 'Printer Issue', 'description' => 'Printing problems, paper jam, toner', 'is_active' => true],
            ['type' => 'Phone/VoIP Issue', 'description' => 'Phone system, VoIP, extension problems', 'is_active' => true],
            ['type' => 'Other', 'description' => 'Other technical issues not listed above', 'is_active' => true],
        ];

        foreach ($types as $type) {
            TicketsType::firstOrCreate(
                ['type' => $type['type']],
                $type
            );
        }

        $this->command->info('✅ Ticket types seeded successfully!');
    }
}
