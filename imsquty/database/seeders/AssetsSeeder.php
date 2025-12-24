<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Asset;

/**
 * AssetsSeeder
 * 
 * Imports 156 assets from legacy monolith to microservices
 * 
 * CRITICAL: Network field consolidation
 * Legacy database has duplicate network fields:
 *   - ip_address & ip (use first non-null)
 *   - mac_address & mac (use first non-null)
 * 
 * Per Phase 1 Decision #3: Consolidate to single fields
 * 
 * Field mapping:
 * - inventory_code → asset_code
 * - asset_type_id → asset_type_id (lookup)
 * - asset_model_id → asset_model_id (lookup)
 * - division_id → division_id (lookup)
 * - location_id → location_id (lookup)
 * - status_id → status_id (lookup)
 * - ip_address/ip → ip (consolidation)
 * - mac_address/mac → mac (consolidation)
 * 
 * Usage:
 *   php artisan db:seed --class=AssetsSeeder
 */
class AssetsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (Asset::count() > 0) {
            $this->command->warn('Assets table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyAssets = $this->fetchLegacyAssets();
            
            if (empty($legacyAssets)) {
                $this->command->info('No legacy assets found.');
                return;
            }

            $this->command->info("Importing " . count($legacyAssets) . " assets with network field consolidation...\n");

            // Build lookup maps
            $typeMap = DB::table('asset_types')->pluck('id', 'code')->toArray();
            $modelMap = DB::table('asset_models')->pluck('id', 'code')->toArray();
            $divisionMap = DB::table('divisions')->pluck('id', 'code')->toArray();
            $locationMap = DB::table('locations')->pluck('id', 'code')->toArray();
            $statusMap = DB::table('statuses')->pluck('id', 'code')->toArray();

            $inserted = 0;
            $failed = 0;
            $unmappedCount = 0;

            foreach ($legacyAssets as $legacyAsset) {
                try {
                    // CRITICAL: Network field consolidation (Phase 1 Decision #3)
                    $ip = $legacyAsset->ip_address ?? $legacyAsset->ip;
                    $mac = $legacyAsset->mac_address ?? $legacyAsset->mac;

                    // Map asset type
                    $typeCode = $legacyAsset->type_code ?? 'COMP';
                    $assetTypeId = $typeMap[$typeCode] ?? null;
                    if (!$assetTypeId) {
                        $assetTypeId = DB::table('asset_types')->where('code', 'COMP')->first()?->id ?? 1;
                        $unmappedCount++;
                    }

                    // Map asset model
                    $modelCode = $legacyAsset->model_code ?? null;
                    $assetModelId = $modelCode ? ($modelMap[$modelCode] ?? null) : null;
                    if (!$assetModelId) {
                        $assetModelId = DB::table('asset_models')->first()?->id;
                        $unmappedCount++;
                    }

                    // Map division
                    $divisionCode = $legacyAsset->division_code ?? 'IT';
                    $divisionId = $divisionMap[$divisionCode] ?? null;
                    if (!$divisionId) {
                        $divisionId = DB::table('divisions')->where('code', 'IT')->first()?->id ?? 1;
                        $unmappedCount++;
                    }

                    // Map location
                    $locationCode = $legacyAsset->location_code ?? 'MAIN';
                    $locationId = $locationMap[$locationCode] ?? null;
                    if (!$locationId) {
                        $locationId = DB::table('locations')->where('code', 'MAIN')->first()?->id ?? 1;
                        $unmappedCount++;
                    }

                    // Map status
                    $statusCode = $legacyAsset->status_code ?? 'ACTIVE';
                    $statusId = $statusMap[$statusCode] ?? null;
                    if (!$statusId) {
                        $statusId = DB::table('statuses')->where('code', 'ACTIVE')->first()?->id ?? 1;
                        $unmappedCount++;
                    }

                    // Create asset with field consolidation
                    Asset::create([
                        'asset_code' => $legacyAsset->inventory_code,
                        'asset_type_id' => $assetTypeId,
                        'asset_model_id' => $assetModelId,
                        'division_id' => $divisionId,
                        'location_id' => $locationId,
                        'status_id' => $statusId,
                        'serial_number' => $legacyAsset->serial_number ?? null,
                        'ip' => $ip, // CONSOLIDATED FROM ip_address & ip
                        'mac' => $mac, // CONSOLIDATED FROM mac_address & mac
                        'hostname' => $legacyAsset->hostname ?? null,
                        'assigned_user_id' => $legacyAsset->assigned_user_id ?? null,
                        'purchase_date' => $legacyAsset->purchase_date ?? null,
                        'warranty_expiry' => $legacyAsset->warranty_expiry ?? null,
                        'cost' => $legacyAsset->cost ?? null,
                        'notes' => $legacyAsset->notes ?? null,
                        'is_active' => $legacyAsset->is_active ?? true,
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ {$legacyAsset->inventory_code} (IP: {$ip}, MAC: {$mac})");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import asset {$legacyAsset->inventory_code}: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 80));
            $this->command->info("Assets Import Summary (with Network Field Consolidation):");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->line("  ⚠ Unmapped relationships: $unmappedCount");
            $this->command->info(str_repeat('=', 80));

        } catch (\Exception $e) {
            $this->command->error("Assets seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch assets from legacy database
     */
    private function fetchLegacyAssets()
    {
        try {
            return DB::connection('mysql')
                ->table('itquty.assets')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.assets: {$e->getMessage()}");
            return $this->getDefaultAssets();
        }
    }

    /**
     * Default assets (fallback)
     * Used when legacy database is unavailable
     */
    private function getDefaultAssets(): array
    {
        return [
            (object)[
                'id' => 1,
                'inventory_code' => 'COMP-001',
                'type_code' => 'COMP',
                'model_code' => 'DELL-OP7090',
                'division_code' => 'IT',
                'location_code' => 'MAIN',
                'status_code' => 'ACTIVE',
                'serial_number' => 'SN-DELL-001',
                'ip_address' => '192.168.1.100',
                'ip' => null,
                'mac_address' => '00:1A:2B:3C:4D:5E',
                'mac' => null,
                'hostname' => 'desktop-01.company.local',
                'assigned_user_id' => 1,
                'purchase_date' => '2023-01-15',
                'warranty_expiry' => '2026-01-15',
                'cost' => 1200.00,
                'notes' => 'Primary workstation - IT Manager',
                'is_active' => true,
            ],
            (object)[
                'id' => 2,
                'inventory_code' => 'COMP-002',
                'type_code' => 'COMP',
                'model_code' => 'DELL-OP7090',
                'division_code' => 'IT',
                'location_code' => 'MAIN',
                'status_code' => 'ACTIVE',
                'serial_number' => 'SN-DELL-002',
                'ip_address' => '192.168.1.101',
                'ip' => null,
                'mac_address' => '00:1A:2B:3C:4D:5F',
                'mac' => null,
                'hostname' => 'desktop-02.company.local',
                'assigned_user_id' => 2,
                'purchase_date' => '2023-01-15',
                'warranty_expiry' => '2026-01-15',
                'cost' => 1200.00,
                'notes' => 'Development workstation',
                'is_active' => true,
            ],
            (object)[
                'id' => 3,
                'inventory_code' => 'SERV-001',
                'type_code' => 'SERV',
                'model_code' => 'DELL-PE750',
                'division_code' => 'IT',
                'location_code' => 'DC',
                'status_code' => 'ACTIVE',
                'serial_number' => 'SN-DELL-SVR-001',
                'ip_address' => '192.168.100.10',
                'ip' => null,
                'mac_address' => '00:1A:2B:3C:4D:60',
                'mac' => null,
                'hostname' => 'server-01.company.local',
                'assigned_user_id' => null,
                'purchase_date' => '2022-06-01',
                'warranty_expiry' => '2025-06-01',
                'cost' => 8500.00,
                'notes' => 'Primary application server',
                'is_active' => true,
            ],
            (object)[
                'id' => 4,
                'inventory_code' => 'PRINT-001',
                'type_code' => 'PRINT',
                'model_code' => 'HP-LJ404',
                'division_code' => 'ADMIN',
                'location_code' => 'MAIN',
                'status_code' => 'ACTIVE',
                'serial_number' => 'SN-HP-PRINT-001',
                'ip_address' => '192.168.1.50',
                'ip' => null,
                'mac_address' => '00:1A:2B:3C:4D:61',
                'mac' => null,
                'hostname' => 'printer-01.company.local',
                'assigned_user_id' => null,
                'purchase_date' => '2023-03-10',
                'warranty_expiry' => '2025-03-10',
                'cost' => 450.00,
                'notes' => 'Network printer - Main floor',
                'is_active' => true,
            ],
        ];
    }
}
