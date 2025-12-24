<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Pcspec;
use App\Models\Asset;

/**
 * PcspecsSeeder
 * 
 * Imports PC specifications from legacy monolith
 * to microservices
 * 
 * PC specifications store detailed hardware information
 * about computer assets including CPU, RAM, Storage, etc.
 * 
 * Field mapping:
 * - asset_id → asset_id (lookup)
 * - processor → processor (CPU details)
 * - ram_gb → ram_gb (Memory in GB)
 * - storage_gb → storage_gb (Storage in GB)
 * - gpu → gpu (Graphics processor)
 * - os → os (Operating system)
 * 
 * Usage:
 *   php artisan db:seed --class=PcspecsSeeder
 */
class PcspecsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (Pcspec::count() > 0) {
            $this->command->warn('PC Specs table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyPcspecs = $this->fetchLegacyPcspecs();
            
            if (empty($legacyPcspecs)) {
                $this->command->info('No legacy PC specs found.');
                return;
            }

            $this->command->info("Importing " . count($legacyPcspecs) . " PC specifications...\n");

            // Build asset code to ID map
            $assetMap = Asset::pluck('id', 'asset_code')->toArray();

            $inserted = 0;
            $failed = 0;
            $unmappedAssets = 0;

            foreach ($legacyPcspecs as $legacySpec) {
                try {
                    // Map asset
                    $assetCode = $legacySpec->inventory_code ?? $legacySpec->asset_code;
                    $assetId = $assetMap[$assetCode] ?? null;
                    
                    if (!$assetId) {
                        // Try to find asset by any means
                        $asset = Asset::where('asset_code', 'like', '%' . substr($assetCode, 0, 4) . '%')->first();
                        $assetId = $asset?->id;
                        $unmappedAssets++;
                    }

                    // Skip if asset not found (orphaned spec)
                    if (!$assetId) {
                        $this->command->warn("  ⚠ No asset found for spec: {$assetCode}");
                        $failed++;
                        continue;
                    }

                    Pcspec::create([
                        'asset_id' => $assetId,
                        'processor' => $legacySpec->processor ?? 'Intel Core i5',
                        'processor_cores' => $legacySpec->processor_cores ?? 4,
                        'processor_speed_ghz' => $legacySpec->processor_speed_ghz ?? 2.4,
                        'ram_gb' => $legacySpec->ram_gb ?? 8,
                        'storage_gb' => $legacySpec->storage_gb ?? 256,
                        'storage_type' => $legacySpec->storage_type ?? 'SSD',
                        'gpu' => $legacySpec->gpu ?? 'Integrated',
                        'os' => $legacySpec->os ?? 'Windows 11 Pro',
                        'os_bit' => $legacySpec->os_bit ?? 64,
                        'bios_version' => $legacySpec->bios_version ?? null,
                        'network_adapter' => $legacySpec->network_adapter ?? 'Gigabit Ethernet',
                        'usb_ports_count' => $legacySpec->usb_ports_count ?? 6,
                        'notes' => $legacySpec->notes ?? null,
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ {$assetCode} ({$legacySpec->processor} / {$legacySpec->ram_gb}GB)");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import PC spec: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 80));
            $this->command->info("PC Specs Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            if ($unmappedAssets > 0) {
                $this->command->line("  ⚠ Unmapped assets: $unmappedAssets");
            }
            $this->command->info(str_repeat('=', 80));

        } catch (\Exception $e) {
            $this->command->error("PC Specs seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch PC specs from legacy database
     */
    private function fetchLegacyPcspecs()
    {
        try {
            return DB::connection('mysql')
                ->table('itquty.pcspecs')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.pcspecs: {$e->getMessage()}");
            return $this->getDefaultPcspecs();
        }
    }

    /**
     * Default PC specs (fallback)
     */
    private function getDefaultPcspecs(): array
    {
        return [
            (object)[
                'id' => 1,
                'inventory_code' => 'COMP-001',
                'asset_code' => 'COMP-001',
                'processor' => 'Intel Core i7-12700',
                'processor_cores' => 12,
                'processor_speed_ghz' => 3.6,
                'ram_gb' => 16,
                'storage_gb' => 512,
                'storage_type' => 'SSD',
                'gpu' => 'Intel Integrated Graphics UHD 770',
                'os' => 'Windows 11 Pro',
                'os_bit' => 64,
                'bios_version' => 'A18',
                'network_adapter' => 'Intel Gigabit Ethernet',
                'usb_ports_count' => 8,
                'notes' => 'High-performance workstation',
            ],
            (object)[
                'id' => 2,
                'inventory_code' => 'COMP-002',
                'asset_code' => 'COMP-002',
                'processor' => 'Intel Core i5-12400',
                'processor_cores' => 6,
                'processor_speed_ghz' => 2.5,
                'ram_gb' => 8,
                'storage_gb' => 256,
                'storage_type' => 'SSD',
                'gpu' => 'Intel Integrated Graphics UHD 730',
                'os' => 'Windows 11 Pro',
                'os_bit' => 64,
                'bios_version' => 'A15',
                'network_adapter' => 'Intel Gigabit Ethernet',
                'usb_ports_count' => 6,
                'notes' => 'Standard workstation',
            ],
            (object)[
                'id' => 3,
                'inventory_code' => 'SERV-001',
                'asset_code' => 'SERV-001',
                'processor' => 'Intel Xeon Gold 5318Y',
                'processor_cores' => 24,
                'processor_speed_ghz' => 3.4,
                'ram_gb' => 64,
                'storage_gb' => 2000,
                'storage_type' => 'SSD',
                'gpu' => 'None',
                'os' => 'Ubuntu Server 22.04 LTS',
                'os_bit' => 64,
                'bios_version' => 'v2.5',
                'network_adapter' => '2x Intel 10Gbe Ethernet',
                'usb_ports_count' => 2,
                'notes' => 'Primary application server',
            ],
        ];
    }
}
