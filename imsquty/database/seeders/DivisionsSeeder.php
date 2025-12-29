<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * DivisionsSeeder
 * 
 * Imports divisions from legacy monolith (itquty.divisions) 
 * to microservices (imsquty.divisions)
 * 
 * Field Mapping:
 * - division_name → name (NAMING_STANDARDIZATION)
 * - abbreviation → code (NAMING_STANDARDIZATION)
 * 
 * Usage:
 *   php artisan db:seed --class=DivisionsSeeder
 */
class DivisionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (DB::table('divisions')->count() > 0) {
            $this->command->warn('Divisions table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyDivisions = $this->fetchLegacyDivisions();
            
            if (empty($legacyDivisions)) {
                $this->command->info('No legacy divisions found.');
                return;
            }

            $this->command->info("Importing " . count($legacyDivisions) . " divisions...\n");

            $inserted = 0;
            $skipped = 0;
            $failed = 0;

            foreach ($legacyDivisions as $legacyDiv) {
                try {
                    // Field mapping with naming standardization
                    // Schema: id, name, code, created_at, updated_at, deleted_at
                    DB::table('divisions')->insert([
                        'name' => $legacyDiv->division_name ?? $legacyDiv->name,
                        'code' => $legacyDiv->abbreviation ?? $legacyDiv->code,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ {$legacyDiv->division_name}");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import division: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Divisions Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Divisions seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch divisions from legacy database
     */
    private function fetchLegacyDivisions()
    {
        try {
            // Try to connect to legacy database
            return DB::connection('mysql')
                ->table('itquty.divisions')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.divisions: {$e->getMessage()}");
            
            // Fallback: Return default divisions
            return $this->getDefaultDivisions();
        }
    }

    /**
     * Default divisions (fallback if legacy DB unavailable)
     */
    private function getDefaultDivisions(): array
    {
        return [
            (object)[
                'id' => 1,
                'division_name' => 'IT Division',
                'abbreviation' => 'IT',
                'description' => 'Information Technology',
                'is_active' => true,
            ],
            (object)[
                'id' => 2,
                'division_name' => 'Operations',
                'abbreviation' => 'OPS',
                'description' => 'Operations Department',
                'is_active' => true,
            ],
            (object)[
                'id' => 3,
                'division_name' => 'Finance',
                'abbreviation' => 'FIN',
                'description' => 'Finance & Accounting',
                'is_active' => true,
            ],
        ];
    }
}
