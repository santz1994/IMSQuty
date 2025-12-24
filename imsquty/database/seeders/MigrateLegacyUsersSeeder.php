<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

/**
 * MigrateLegacyUsersSeeder
 * 
 * Imports users from old monolith database (quty2.users)
 * Maps field names and handles data transformations
 * 
 * Usage:
 *   php artisan db:seed --class=MigrateLegacyUsersSeeder
 * 
 * Documentation: docs/DATABASE_SCHEMA_MAPPING.md
 */
class MigrateLegacyUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if ($this->userCountExceeds(10)) {
            $this->command->warn('Users table already populated. Skipping migration.');
            return;
        }

        try {
            // Connect to old database (if configured)
            $legacyUsers = $this->fetchLegacyUsers();
            
            if (empty($legacyUsers)) {
                $this->command->info('No legacy users found.');
                return;
            }

            $inserted = 0;
            $skipped = 0;
            $failed = 0;

            $this->command->info("Importing " . count($legacyUsers) . " users from legacy system...\n");

            foreach ($legacyUsers as $oldUser) {
                try {
                    $this->migrateUser($oldUser, $inserted, $skipped);
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("Failed to import user {$oldUser['email']}: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Migration Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ⊘ Skipped: $skipped");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Migration failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch users from legacy database
     */
    private function fetchLegacyUsers()
    {
        // Try connecting to old database config
        try {
            // Option 1: Direct query if connection configured
            $legacyConnection = config('database.connections.legacy_mysql');
            
            if ($legacyConnection) {
                return DB::connection('legacy_mysql')
                    ->table('users')
                    ->whereNull('deleted_at')
                    ->get()
                    ->toArray();
            }
        } catch (\Exception $e) {
            $this->command->warn("Legacy database connection not available: {$e->getMessage()}");
        }

        // Option 2: Use SQL dump data (hardcoded for now)
        return $this->getHardcodedUsers();
    }

    /**
     * Hardcoded users from export (fallback for testing)
     * In production, connect to legacy DB or load from seed data file
     */
    private function getHardcodedUsers()
    {
        return [
            // Format from itquty.sql dump:
            // (id, supabase_id, name, email, notify_email, notify_ticket_created, 
            //  notify_ticket_assigned, notify_ticket_updated, notify_meeting_approved,
            //  notify_meeting_rejected, profile_picture, division_id, location_id, 
            //  phone, is_active, last_login_at, password, api_token, remember_token, created_at, updated_at)
            
            [
                'id' => 4,
                'supabase_id' => null,
                'name' => 'Daniel',
                'email' => 'daniel@quty.co.id',
                'notify_email' => true,
                'notify_ticket_created' => true,
                'notify_ticket_assigned' => true,
                'notify_ticket_updated' => true,
                'notify_meeting_approved' => true,
                'notify_meeting_rejected' => true,
                'profile_picture' => null,
                'division_id' => 1,
                'location_id' => 14,
                'phone' => null,
                'is_active' => true,
                'password' => '$2y$12$S3.aDHEA35oiR3D9ykwqSOWhji/jnZxkIBJGmO6ifaear0hswthni',
                'created_at' => '2025-11-06 05:43:43',
                'updated_at' => '2025-12-05 08:49:57',
            ],
            [
                'id' => 5,
                'supabase_id' => null,
                'name' => 'Idol',
                'email' => 'idol@quty.co.id',
                'notify_email' => true,
                'notify_ticket_created' => true,
                'notify_ticket_assigned' => true,
                'notify_ticket_updated' => true,
                'notify_meeting_approved' => true,
                'notify_meeting_rejected' => true,
                'profile_picture' => null,
                'division_id' => 1,
                'location_id' => null,
                'phone' => null,
                'is_active' => true,
                'password' => '$2y$12$xbevkV962YKGlJNeAAF/mOtRrryAvG.vaf9xKpstixJT5eAa9lyki',
                'created_at' => '2025-11-06 05:43:43',
                'updated_at' => '2025-12-05 09:01:25',
            ],
            [
                'id' => 6,
                'supabase_id' => null,
                'name' => 'Ridwan',
                'email' => 'ridwan_it@quty.co.id',
                'notify_email' => true,
                'notify_ticket_created' => true,
                'notify_ticket_assigned' => true,
                'notify_ticket_updated' => true,
                'notify_meeting_approved' => true,
                'notify_meeting_rejected' => true,
                'profile_picture' => null,
                'division_id' => 1,
                'location_id' => null,
                'phone' => null,
                'is_active' => true,
                'password' => '$2y$12$dXIP7ms2Gn/d7SFdQXMER..rk73pIbuNOlR41./teiNexbTW9.XH2',
                'created_at' => '2025-11-06 05:43:43',
                'updated_at' => '2025-12-05 09:10:46',
            ],
            [
                'id' => 14,
                'supabase_id' => null,
                'name' => 'Receptionist',
                'email' => 'receptionist@quty.co.id',
                'notify_email' => true,
                'notify_ticket_created' => true,
                'notify_ticket_assigned' => true,
                'notify_ticket_updated' => true,
                'notify_meeting_approved' => true,
                'notify_meeting_rejected' => true,
                'profile_picture' => null,
                'division_id' => 31,
                'location_id' => null,
                'phone' => null,
                'is_active' => true,
                'password' => '$2y$12$prFApsXHSxzC2ZbCApKThenlockBDKM4jLzH.fjeJ4Rtu2yZuiwGW',
                'created_at' => '2025-11-06 05:49:05',
                'updated_at' => '2025-11-19 00:51:58',
            ],
        ];
    }

    /**
     * Migrate individual user record
     */
    private function migrateUser(array $oldUser, &$inserted, &$skipped): void
    {
        // Check if user already exists
        if (DB::table('users')->where('email', $oldUser['email'])->exists()) {
            $skipped++;
            return;
        }

        // Validate required fields
        if (empty($oldUser['email']) || empty($oldUser['name'])) {
            throw new \Exception("Missing required fields (email/name)");
        }

        // Validate foreign keys exist
        if ($oldUser['division_id'] ?? null) {
            $divisionExists = DB::table('divisions')
                ->where('id', $oldUser['division_id'])
                ->exists();
            
            if (!$divisionExists) {
                throw new \Exception("Division ID {$oldUser['division_id']} does not exist");
            }
        }

        if ($oldUser['location_id'] ?? null) {
            $locationExists = DB::table('locations')
                ->where('id', $oldUser['location_id'])
                ->exists();
            
            if (!$locationExists) {
                throw new \Exception("Location ID {$oldUser['location_id']} does not exist");
            }
        }

        // Insert user
        DB::table('users')->insert([
            'id' => $oldUser['id'],
            'supabase_id' => $oldUser['supabase_id'] ?? null,
            'name' => $oldUser['name'],
            'email' => $oldUser['email'],
            'password' => $oldUser['password'] ?? Hash::make('DefaultPassword123!'),
            'notify_email' => (bool) ($oldUser['notify_email'] ?? 1),
            'notify_ticket_created' => (bool) ($oldUser['notify_ticket_created'] ?? 1),
            'notify_ticket_assigned' => (bool) ($oldUser['notify_ticket_assigned'] ?? 1),
            'notify_ticket_updated' => (bool) ($oldUser['notify_ticket_updated'] ?? 1),
            'notify_meeting_approved' => (bool) ($oldUser['notify_meeting_approved'] ?? 1),
            'notify_meeting_rejected' => (bool) ($oldUser['notify_meeting_rejected'] ?? 1),
            'profile_picture' => $oldUser['profile_picture'] ?? null,
            'division_id' => $oldUser['division_id'] ?? null,
            'location_id' => $oldUser['location_id'] ?? null,
            'phone' => $oldUser['phone'] ?? null,
            'is_active' => (bool) ($oldUser['is_active'] ?? 1),
            'last_login_at' => $oldUser['last_login_at'] ?? null,
            'created_at' => $oldUser['created_at'] ?? now(),
            'updated_at' => $oldUser['updated_at'] ?? now(),
        ]);

        $inserted++;

        // Log audit entry
        DB::table('audit_logs')->insert([
            'user_id' => $oldUser['id'],
            'action' => 'create',
            'model' => 'User',
            'model_type' => 'App\\User',
            'model_id' => $oldUser['id'],
            'description' => "User '{$oldUser['name']}' imported from legacy system",
            'event_type' => 'model',
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Seeder/Migration',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->line("  ✓ {$oldUser['email']} (ID: {$oldUser['id']})");
    }

    /**
     * Check if users table already has data
     */
    private function userCountExceeds(int $threshold): bool
    {
        return DB::table('users')->count() > $threshold;
    }
}
