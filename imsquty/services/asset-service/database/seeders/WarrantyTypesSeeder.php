<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * WarrantyTypesSeeder
 * 
 * Imports warranty types from legacy monolith (itquty.warranty_types)
 * to microservices (imsquty.warranty_types)
 * 
 * Field Mapping:
 * - warranty_name → name (NAMING_STANDARDIZATION)
 * 
 * Usage:
 *   php artisan db:seed --class=WarrantyTypesSeeder
 */
class WarrantyTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (DB::table('warranty_types')->count() > 0) {
            $this->command->warn('Warranty Types table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyWarrantyTypes = $this->fetchLegacyWarrantyTypes();
            
            if (empty($legacyWarrantyTypes)) {
                $this->command->info('No legacy warranty types found.');
                return;
            }

            $this->command->info("Importing " . count($legacyWarrantyTypes) . " warranty types...\n");

            $inserted = 0;
            $failed = 0;

            foreach ($legacyWarrantyTypes as $legacyWT) {
                try {
                    // Field mapping with naming standardization (use correct schema)
                    DB::table('warranty_types')->insert([
                        'name' => $legacyWT->warranty_name ?? $legacyWT->name,
                        'coverage_months' => $legacyWT->coverage_months ?? $legacyWT->duration_months ?? 12,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ {$legacyWT->warranty_name}");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import warranty type: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Warranty Types Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Warranty Types seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch warranty types from legacy database
     */
    private function fetchLegacyWarrantyTypes()
    {
        try {
            return DB::connection('mysql')
                ->table('itquty.warranty_types')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.warranty_types: {$e->getMessage()}");
            return $this->getDefaultWarrantyTypes();
        }
    }

    /**
     * Default warranty types (fallback if legacy DB unavailable)
     */
    private function getDefaultWarrantyTypes(): array
    {
        return [
            (object)[
                'id' => 1,
                'warranty_name' => 'Standard Warranty',
                'code' => 'STD',
                'description' => 'Standard 1-year hardware warranty',
                'duration_months' => 12,
                'is_active' => true,
            ],
            (object)[
                'id' => 2,
                'warranty_name' => 'Extended Warranty',
                'code' => 'EXT',
                'description' => 'Extended 3-year warranty',
                'duration_months' => 36,
                'is_active' => true,
            ],
            (object)[
                'id' => 3,
                'warranty_name' => 'Premium Support',
                'code' => 'PREM',
                'description' => 'Premium support with 24/7 coverage',
                'duration_months' => 24,
                'is_active' => true,
            ],
            (object)[
                'id' => 4,
                'warranty_name' => 'No Warranty',
                'code' => 'NONE',
                'description' => 'As-is, no warranty',
                'duration_months' => 0,
                'is_active' => true,
            ],
        ];
    }
}
