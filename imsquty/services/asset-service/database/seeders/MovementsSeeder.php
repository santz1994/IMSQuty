<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Movement;
use App\Models\Asset;
use App\Models\Location;
use App\Models\User;

/**
 * MovementsSeeder
 * 
 * Imports asset movements (transfers) from legacy monolith
 * to microservices
 * 
 * Tracks when assets are moved from one location to another
 * or reassigned to different users. Critical for audit trail.
 * 
 * Field mapping:
 * - asset_id → asset_id (lookup)
 * - from_location_id → from_location_id (lookup)
 * - to_location_id → to_location_id (lookup)
 * - from_user_id → from_user_id (lookup)
 * - to_user_id → to_user_id (lookup)
 * - movement_date → moved_at
 * - reason → reason
 * 
 * Usage:
 *   php artisan db:seed --class=MovementsSeeder
 */
class MovementsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (Movement::count() > 0) {
            $this->command->warn('Movements table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyMovements = $this->fetchLegacyMovements();
            
            if (empty($legacyMovements)) {
                $this->command->info('No legacy movements found.');
                return;
            }

            $this->command->info("Importing " . count($legacyMovements) . " asset movements...\n");

            // Build lookup maps
            $assetMap = Asset::pluck('id', 'asset_code')->toArray();
            $locationMap = Location::pluck('id', 'code')->toArray();
            $userMap = User::pluck('id', 'email')->toArray();

            $inserted = 0;
            $failed = 0;

            foreach ($legacyMovements as $legacyMovement) {
                try {
                    // Map asset
                    $assetId = $assetMap[$legacyMovement->asset_code] ?? null;
                    if (!$assetId) {
                        continue; // Skip if asset not found
                    }

                    // Map locations
                    $fromLocationId = $legacyMovement->from_location_code 
                        ? $locationMap[$legacyMovement->from_location_code] ?? null 
                        : null;
                    
                    $toLocationId = $legacyMovement->to_location_code 
                        ? $locationMap[$legacyMovement->to_location_code] ?? null 
                        : null;

                    // Map users
                    $fromUserId = $legacyMovement->from_user_email 
                        ? $userMap[$legacyMovement->from_user_email] ?? null 
                        : null;
                    
                    $toUserId = $legacyMovement->to_user_email 
                        ? $userMap[$legacyMovement->to_user_email] ?? null 
                        : null;

                    Movement::create([
                        'asset_id' => $assetId,
                        'from_location_id' => $fromLocationId,
                        'to_location_id' => $toLocationId,
                        'from_user_id' => $fromUserId,
                        'to_user_id' => $toUserId,
                        'reason' => $legacyMovement->reason ?? 'Asset movement',
                        'notes' => $legacyMovement->notes ?? null,
                        'moved_at' => $legacyMovement->movement_date ?? now(),
                        'moved_by_user_id' => $userMap[$legacyMovement->moved_by_email] ?? null,
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ Movement: {$legacyMovement->asset_code}");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import movement: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Movements Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Movements seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch movements from legacy database
     */
    private function fetchLegacyMovements()
    {
        try {
            return DB::connection('mysql')
                ->table('itquty.movements')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.movements: {$e->getMessage()}");
            return [];
        }
    }
}
