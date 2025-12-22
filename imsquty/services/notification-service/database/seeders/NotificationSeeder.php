<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::factory()->count(5)->create();

        // Create sample notifications
        foreach ($users as $user) {
            // Sent notifications
            Notification::factory()->count(3)->sent()->create([
                'recipient_id' => $user->id,
                'recipient_email' => $user->email
            ]);

            // Pending notifications
            Notification::factory()->count(2)->pending()->create([
                'recipient_id' => $user->id,
                'recipient_email' => $user->email
            ]);

            // Unread notifications
            Notification::factory()->count(2)->unread()->create([
                'recipient_id' => $user->id,
                'recipient_email' => $user->email
            ]);

            // Urgent notification
            Notification::factory()->urgent()->create([
                'recipient_id' => $user->id,
                'recipient_email' => $user->email,
                'title' => 'Urgent: System Maintenance',
                'message' => 'System maintenance scheduled for tonight at 10 PM.'
            ]);
        }
    }
}
