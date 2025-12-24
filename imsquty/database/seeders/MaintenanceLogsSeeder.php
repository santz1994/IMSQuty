<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\MaintenanceLog;
use App\Models\Asset;
use App\Models\User;

/**
 * MaintenanceLogsSeeder
 * 
 * Imports maintenance/repair records from legacy monolith
 * to microservices
 * 
 * Tracks maintenance, repairs, and service history for assets
 * 
 * Field mapping:
 * - asset_id → asset_id (lookup)
 * - maintenance_type → type
 * - maintenance_date → performed_at
 * - technician_id → performed_by_user_id (lookup)
 * - description → description
 * - cost → cost
 * 
 * Usage:
 *   php artisan db:seed --class=MaintenanceLogsSeeder
 */
class MaintenanceLogsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (MaintenanceLog::count() > 0) {
            $this->command->warn('Maintenance Logs table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyLogs = $this->fetchLegacyMaintenanceLogs();
            
            if (empty($legacyLogs)) {
                $this->command->info('No legacy maintenance logs found.');
                return;
            }

            $this->command->info("Importing " . count($legacyLogs) . " maintenance records...\n");

            // Build lookup maps
            $assetMap = Asset::pluck('id', 'asset_code')->toArray();
            $userMap = User::pluck('id', 'email')->toArray();

            $inserted = 0;
            $failed = 0;

            foreach ($legacyLogs as $legacyLog) {
                try {
                    // Map asset
                    $assetId = $assetMap[$legacyLog->asset_code] ?? null;
                    if (!$assetId) {
                        continue; // Skip if asset not found
                    }

                    // Map technician
                    $performedByUserId = $legacyLog->technician_email 
                        ? $userMap[$legacyLog->technician_email] ?? null 
                        : null;

                    MaintenanceLog::create([
                        'asset_id' => $assetId,
                        'type' => $legacyLog->maintenance_type ?? 'Maintenance',
                        'description' => $legacyLog->description ?? null,
                        'performed_by_user_id' => $performedByUserId,
                        'performed_at' => $legacyLog->maintenance_date ?? now(),
                        'cost' => $legacyLog->cost ?? 0.00,
                        'notes' => $legacyLog->notes ?? null,
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ Maintenance: {$legacyLog->asset_code} - {$legacyLog->maintenance_type}");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import maintenance log: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Maintenance Logs Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Maintenance Logs seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch maintenance logs from legacy database
     */
    private function fetchLegacyMaintenanceLogs()
    {
        try {
            return DB::connection('mysql')
                ->table('itquty.maintenance_logs')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.maintenance_logs: {$e->getMessage()}");
            return [];
        }
    }
}
