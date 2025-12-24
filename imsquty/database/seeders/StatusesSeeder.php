<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Status;

/**
 * StatusesSeeder
 * 
 * Imports asset statuses from legacy monolith
 * to microservices
 * 
 * Statuses are critical for asset lifecycle tracking:
 * - Active: Asset in use
 * - Inactive: Asset not in use but available
 * - Maintenance: Asset undergoing maintenance
 * - Decommissioned: Asset removed from service
 * - Reserved: Asset reserved for future use
 * 
 * Usage:
 *   php artisan db:seed --class=StatusesSeeder
 */
class StatusesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (Status::count() > 0) {
            $this->command->warn('Statuses table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyStatuses = $this->fetchLegacyStatuses();
            
            if (empty($legacyStatuses)) {
                $this->command->info('No legacy statuses found.');
                return;
            }

            $this->command->info("Importing " . count($legacyStatuses) . " statuses...\n");

            $inserted = 0;
            $failed = 0;

            foreach ($legacyStatuses as $legacyStatus) {
                try {
                    Status::create([
                        'name' => $legacyStatus->status_name ?? $legacyStatus->name,
                        'code' => $legacyStatus->status_code ?? $legacyStatus->code,
                        'description' => $legacyStatus->description ?? null,
                        'color' => $legacyStatus->color ?? '#6C757D',
                        'is_active' => $legacyStatus->is_active ?? true,
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ {$legacyStatus->status_name}");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import status: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Statuses Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Statuses seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch statuses from legacy database
     */
    private function fetchLegacyStatuses()
    {
        try {
            return DB::connection('mysql')
                ->table('itquty.statuses')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.statuses: {$e->getMessage()}");
            return $this->getDefaultStatuses();
        }
    }

    /**
     * Default statuses (fallback)
     */
    private function getDefaultStatuses(): array
    {
        return [
            (object)[
                'id' => 1,
                'status_name' => 'Active',
                'status_code' => 'ACTIVE',
                'description' => 'Asset is actively in use',
                'color' => '#28A745',
                'is_active' => true,
            ],
            (object)[
                'id' => 2,
                'status_name' => 'Inactive',
                'status_code' => 'INACTIVE',
                'description' => 'Asset is available but not currently in use',
                'color' => '#6C757D',
                'is_active' => true,
            ],
            (object)[
                'id' => 3,
                'status_name' => 'Maintenance',
                'status_code' => 'MAINTENANCE',
                'description' => 'Asset is undergoing maintenance or repair',
                'color' => '#FFC107',
                'is_active' => true,
            ],
            (object)[
                'id' => 4,
                'status_name' => 'Decommissioned',
                'status_code' => 'DECOMMISSIONED',
                'description' => 'Asset has been removed from service',
                'color' => '#DC3545',
                'is_active' => true,
            ],
            (object)[
                'id' => 5,
                'status_name' => 'Reserved',
                'status_code' => 'RESERVED',
                'description' => 'Asset is reserved for future use',
                'color' => '#17A2B8',
                'is_active' => true,
            ],
        ];
    }
}
