<?php

namespace Database\Seeders;

use App\Models\Report;
use App\Models\ReportSchedule;
use Illuminate\Database\Seeder;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        // Create completed reports
        Report::factory()->count(10)->completed()->create([
            'type' => 'Asset'
        ]);

        Report::factory()->count(5)->completed()->create([
            'type' => 'Ticket'
        ]);

        Report::factory()->count(3)->completed()->create([
            'type' => 'Financial'
        ]);

        // Create pending reports
        Report::factory()->count(2)->pending()->create();

        // Create processing reports
        Report::factory()->count(1)->processing()->create();

        // Create failed reports
        Report::factory()->count(1)->failed()->create();

        // Create report schedules
        ReportSchedule::factory()->daily()->create([
            'name' => 'Daily Asset Report',
            'report_type' => 'Asset',
            'recipients' => ['admin@example.com', 'manager@example.com']
        ]);

        ReportSchedule::factory()->weekly()->create([
            'name' => 'Weekly Ticket Summary',
            'report_type' => 'Ticket',
            'recipients' => ['support@example.com']
        ]);

        ReportSchedule::factory()->create([
            'name' => 'Monthly Financial Report',
            'report_type' => 'Financial',
            'frequency' => 'Monthly',
            'next_run_at' => now()->addMonth(),
            'recipients' => ['finance@example.com', 'cfo@example.com']
        ]);

        // Create inactive schedule
        ReportSchedule::factory()->inactive()->create([
            'name' => 'Deprecated Inventory Report',
            'report_type' => 'Inventory'
        ]);
    }
}
