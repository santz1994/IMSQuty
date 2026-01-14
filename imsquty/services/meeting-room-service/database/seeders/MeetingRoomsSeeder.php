<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MeetingRoomsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = Carbon::now();

        $rooms = [
            [
                'name' => 'Meeting Room A',
                'code' => 'MR-A',
                'capacity' => 8,
                'floor' => 1,
                'building' => 'Main Office',
                'facilities' => json_encode(['TV Display', 'Whiteboard', 'AC', 'WiFi']),
                'description' => 'Small meeting room for team discussions',
                'status' => 'available',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Meeting Room B',
                'code' => 'MR-B',
                'capacity' => 12,
                'floor' => 1,
                'building' => 'Main Office',
                'facilities' => json_encode(['Projector', 'TV Display', 'Whiteboard', 'AC', 'WiFi', 'Conference Phone']),
                'description' => 'Medium meeting room with projector',
                'status' => 'available',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Meeting Room C',
                'code' => 'MR-C',
                'capacity' => 6,
                'floor' => 2,
                'building' => 'Main Office',
                'facilities' => json_encode(['TV Display', 'Whiteboard', 'AC', 'WiFi']),
                'description' => 'Huddle room for quick meetings',
                'status' => 'available',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Board Room',
                'code' => 'BR-01',
                'capacity' => 20,
                'floor' => 3,
                'building' => 'Main Office',
                'facilities' => json_encode(['Projector', 'TV Display', 'Whiteboard', 'AC', 'WiFi', 'Video Conference', 'Coffee Station']),
                'description' => 'Executive board room for important meetings',
                'status' => 'available',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Training Room',
                'code' => 'TR-01',
                'capacity' => 30,
                'floor' => 2,
                'building' => 'Main Office',
                'facilities' => json_encode(['Projector', 'TV Display', 'Whiteboard', 'AC', 'WiFi', 'Sound System', 'Movable Chairs']),
                'description' => 'Large training room for workshops and seminars',
                'status' => 'available',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Conference Room',
                'code' => 'CR-01',
                'capacity' => 15,
                'floor' => 3,
                'building' => 'Main Office',
                'facilities' => json_encode(['Video Conference', 'Projector', 'TV Display', 'Whiteboard', 'AC', 'WiFi', 'Recording Equipment']),
                'description' => 'Conference room with video conferencing capabilities',
                'status' => 'available',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        // Use insert or ignore to make seeder idempotent
        foreach ($rooms as $room) {
            $exists = DB::table('meeting_rooms')->where('code', $room['code'])->exists();
            
            if (!$exists) {
                DB::table('meeting_rooms')->insert($room);
                $this->command->info("✅ Created room: {$room['name']}");
            } else {
                $this->command->info("⏭️  Skipped (already exists): {$room['name']}");
            }
        }

        $this->command->info('✅ Meeting rooms seeding complete!');
    }
}
