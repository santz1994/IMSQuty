<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SLAPolicySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();
        
        DB::table('sla_policies')->insert([
            [
                'id' => 1,
                'name' => 'Urgent Priority SLA',
                'description' => 'SLA policy for urgent priority tickets requiring immediate attention',
                'response_time' => 60,
                'resolution_time' => 240,
                'priority_id' => 1,
                'business_hours_only' => false,
                'escalation_time' => 120,
                'escalate_to_user_id' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'name' => 'High Priority SLA',
                'description' => 'SLA policy for high priority tickets',
                'response_time' => 240,
                'resolution_time' => 1440,
                'priority_id' => 2,
                'business_hours_only' => true,
                'escalation_time' => 720,
                'escalate_to_user_id' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'name' => 'Normal Priority SLA',
                'description' => 'SLA policy for normal/medium priority tickets',
                'response_time' => 1440,
                'resolution_time' => 4320,
                'priority_id' => 3,
                'business_hours_only' => true,
                'escalation_time' => null,
                'escalate_to_user_id' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 4,
                'name' => 'Low Priority SLA',
                'description' => 'SLA policy for low priority tickets',
                'response_time' => 2880,
                'resolution_time' => 10080,
                'priority_id' => 4,
                'business_hours_only' => true,
                'escalation_time' => null,
                'escalate_to_user_id' => null,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
