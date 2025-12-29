<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * ManufacturersSeeder
 * 
 * Imports manufacturers from legacy monolith (itquty.manufacturers)
 * to microservices (imsquty.manufacturers)
 * 
 * Field Mapping:
 * - manufacturer_name → name (NAMING_STANDARDIZATION)
 * - abbreviation → code (NAMING_STANDARDIZATION)
 * 
 * Usage:
 *   php artisan db:seed --class=ManufacturersSeeder
 */
class ManufacturersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (DB::table('manufacturers')->count() > 0) {
            $this->command->warn('Manufacturers table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyManufacturers = $this->fetchLegacyManufacturers();
            
            if (empty($legacyManufacturers)) {
                $this->command->info('No legacy manufacturers found.');
                return;
            }

            $this->command->info("Importing " . count($legacyManufacturers) . " manufacturers...\n");

            $inserted = 0;
            $skipped = 0;
            $failed = 0;

            foreach ($legacyManufacturers as $legacyMfg) {
                try {
                    // Field mapping with naming standardization
                    // Schema: id, name, country, contact_email, notes, created_at, updated_at, deleted_at
                    DB::table('manufacturers')->insert([
                        'name' => $legacyMfg->manufacturer_name ?? $legacyMfg->name,
                        'country' => $legacyMfg->country ?? null,
                        'contact_email' => $legacyMfg->email ?? null,
                        'notes' => $legacyMfg->notes ?? null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ {$legacyMfg->manufacturer_name}");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import manufacturer: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Manufacturers Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Manufacturers seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch manufacturers from legacy database
     */
    private function fetchLegacyManufacturers()
    {
        try {
            // Try to connect to legacy database
            return DB::connection('mysql')
                ->table('itquty.manufacturers')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.manufacturers: {$e->getMessage()}");
            
            // Fallback: Return default manufacturers
            return $this->getDefaultManufacturers();
        }
    }

    /**
     * Default manufacturers (fallback if legacy DB unavailable)
     */
    private function getDefaultManufacturers(): array
    {
        return [
            (object)[
                'id' => 1,
                'manufacturer_name' => 'Dell Technologies',
                'abbreviation' => 'DELL',
                'contact_person' => 'Sales Team',
                'phone' => '+1-800-123-4567',
                'email' => 'sales@dell.com',
                'website' => 'www.dell.com',
                'is_active' => true,
            ],
            (object)[
                'id' => 2,
                'manufacturer_name' => 'HP Inc',
                'abbreviation' => 'HP',
                'contact_person' => 'Sales Team',
                'phone' => '+1-800-234-5678',
                'email' => 'sales@hp.com',
                'website' => 'www.hp.com',
                'is_active' => true,
            ],
            (object)[
                'id' => 3,
                'manufacturer_name' => 'Lenovo',
                'abbreviation' => 'LENOVO',
                'contact_person' => 'Sales Team',
                'phone' => '+1-800-345-6789',
                'email' => 'sales@lenovo.com',
                'website' => 'www.lenovo.com',
                'is_active' => true,
            ],
        ];
    }
}
