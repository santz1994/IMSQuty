<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\AssetType;

/**
 * AssetTypesSeeder
 * 
 * Imports asset types (categories) from legacy monolith
 * to microservices
 * 
 * Usage:
 *   php artisan db:seed --class=AssetTypesSeeder
 */
class AssetTypesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (AssetType::count() > 0) {
            $this->command->warn('Asset Types table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyAssetTypes = $this->fetchLegacyAssetTypes();
            
            if (empty($legacyAssetTypes)) {
                $this->command->info('No legacy asset types found.');
                return;
            }

            $this->command->info("Importing " . count($legacyAssetTypes) . " asset types...\n");

            $inserted = 0;
            $failed = 0;

            foreach ($legacyAssetTypes as $legacyAT) {
                try {
                    AssetType::create([
                        'name' => $legacyAT->type_name ?? $legacyAT->name,
                        'code' => $legacyAT->type_code ?? $legacyAT->code,
                        'description' => $legacyAT->description ?? null,
                        'is_active' => $legacyAT->is_active ?? true,
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ {$legacyAT->type_name}");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import asset type: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Asset Types Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Asset Types seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch asset types from legacy database
     */
    private function fetchLegacyAssetTypes()
    {
        try {
            return DB::connection('mysql')
                ->table('itquty.asset_types')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.asset_types: {$e->getMessage()}");
            return $this->getDefaultAssetTypes();
        }
    }

    /**
     * Default asset types (fallback)
     */
    private function getDefaultAssetTypes(): array
    {
        return [
            (object)[
                'id' => 1,
                'type_name' => 'Computer',
                'type_code' => 'COMP',
                'description' => 'Desktop & Laptop Computers',
                'is_active' => true,
            ],
            (object)[
                'id' => 2,
                'type_name' => 'Printer',
                'type_code' => 'PRINT',
                'description' => 'Printers & Copiers',
                'is_active' => true,
            ],
            (object)[
                'id' => 3,
                'type_name' => 'Network Equipment',
                'type_code' => 'NET',
                'description' => 'Routers, Switches, Network Devices',
                'is_active' => true,
            ],
            (object)[
                'id' => 4,
                'type_name' => 'Server',
                'type_code' => 'SERV',
                'description' => 'Server Hardware',
                'is_active' => true,
            ],
        ];
    }
}
