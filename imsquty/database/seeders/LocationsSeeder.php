<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Location;

/**
 * LocationsSeeder
 * 
 * Imports locations from legacy monolith (itquty.locations)
 * to microservices (imsquty.locations)
 * 
 * Field Mapping:
 * - location_name → name (NAMING_STANDARDIZATION)
 * - location_code → code (NAMING_STANDARDIZATION)
 * 
 * Usage:
 *   php artisan db:seed --class=LocationsSeeder
 */
class LocationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (Location::count() > 0) {
            $this->command->warn('Locations table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyLocations = $this->fetchLegacyLocations();
            
            if (empty($legacyLocations)) {
                $this->command->info('No legacy locations found.');
                return;
            }

            $this->command->info("Importing " . count($legacyLocations) . " locations...\n");

            $inserted = 0;
            $skipped = 0;
            $failed = 0;

            foreach ($legacyLocations as $legacyLoc) {
                try {
                    // Field mapping with naming standardization
                    Location::create([
                        'name' => $legacyLoc->location_name ?? $legacyLoc->name,
                        'code' => $legacyLoc->location_code ?? $legacyLoc->code,
                        'building' => $legacyLoc->building ?? null,
                        'floor' => $legacyLoc->floor ?? null,
                        'room_number' => $legacyLoc->room_number ?? null,
                        'is_active' => $legacyLoc->is_active ?? true,
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ {$legacyLoc->location_name}");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import location: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Locations Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Locations seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch locations from legacy database
     */
    private function fetchLegacyLocations()
    {
        try {
            // Try to connect to legacy database
            return DB::connection('mysql')
                ->table('itquty.locations')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.locations: {$e->getMessage()}");
            
            // Fallback: Return default locations
            return $this->getDefaultLocations();
        }
    }

    /**
     * Default locations (fallback if legacy DB unavailable)
     */
    private function getDefaultLocations(): array
    {
        return [
            (object)[
                'id' => 1,
                'location_name' => 'Main Office',
                'location_code' => 'MO-001',
                'building' => 'Building A',
                'floor' => 1,
                'room_number' => '101',
                'is_active' => true,
            ],
            (object)[
                'id' => 2,
                'location_name' => 'Data Center',
                'location_code' => 'DC-001',
                'building' => 'Building B',
                'floor' => 2,
                'room_number' => null,
                'is_active' => true,
            ],
            (object)[
                'id' => 3,
                'location_name' => 'Warehouse',
                'location_code' => 'WH-001',
                'building' => 'Building C',
                'floor' => 0,
                'room_number' => null,
                'is_active' => true,
            ],
        ];
    }
}
