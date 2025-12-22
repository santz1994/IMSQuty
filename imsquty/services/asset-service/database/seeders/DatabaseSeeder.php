<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AssetType;
use App\Models\Status;
use App\Models\AssetModel;
use App\Models\Asset;
use Illuminate\Support\Facades\DB;

/**
 * Asset Service Database Seeder
 * 
 * Seeds essential data for asset management:
 * - Asset Types (Desktop, Laptop, Monitor, etc.)
 * - Statuses (Available, Assigned, etc.)
 * - Sample Asset Models
 * - Sample Assets
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::beginTransaction();

        try {
            $this->seedAssetTypes();
            $this->seedStatuses();
            $this->seedAssetModels();
            $this->seedSampleAssets();

            DB::commit();
            $this->command->info('✅ Asset Service database seeded successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('❌ Seeding failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Seed asset types
     */
    private function seedAssetTypes(): void
    {
        $types = [
            ['name' => 'Desktop', 'code' => 'desktop', 'icon' => 'computer', 'description' => 'Desktop computers and workstations'],
            ['name' => 'Laptop', 'code' => 'laptop', 'icon' => 'laptop', 'description' => 'Portable computers and notebooks'],
            ['name' => 'Monitor', 'code' => 'monitor', 'icon' => 'monitor', 'description' => 'Display screens and monitors'],
            ['name' => 'Printer', 'code' => 'printer', 'icon' => 'printer', 'description' => 'Printers and multifunction devices'],
            ['name' => 'Network Device', 'code' => 'network_device', 'icon' => 'router', 'description' => 'Routers, switches, and network equipment'],
            ['name' => 'Server', 'code' => 'server', 'icon' => 'server', 'description' => 'Physical and rack-mounted servers'],
            ['name' => 'Storage', 'code' => 'storage', 'icon' => 'harddrive', 'description' => 'NAS, SAN, and external storage devices'],
            ['name' => 'Mobile Device', 'code' => 'mobile_device', 'icon' => 'smartphone', 'description' => 'Smartphones and tablets'],
            ['name' => 'Peripheral', 'code' => 'peripheral', 'icon' => 'mouse', 'description' => 'Keyboards, mice, and other peripherals'],
            ['name' => 'Software', 'code' => 'software', 'icon' => 'code', 'description' => 'Software licenses and subscriptions'],
        ];

        foreach ($types as $type) {
            AssetType::create(array_merge($type, [
                'is_active' => true,
                'created_by' => 1,
            ]));
        }

        $this->command->info('  ✓ Asset types seeded (10 types)');
    }

    /**
     * Seed statuses
     */
    private function seedStatuses(): void
    {
        $statuses = [
            // Asset statuses
            ['name' => 'Available', 'code' => 'available', 'category' => 'asset', 'color' => '#28a745', 'description' => 'Asset is available in stock'],
            ['name' => 'Assigned', 'code' => 'assigned', 'category' => 'asset', 'color' => '#007bff', 'description' => 'Asset is assigned to a user'],
            ['name' => 'In Maintenance', 'code' => 'maintenance', 'category' => 'asset', 'color' => '#ffc107', 'description' => 'Asset is under maintenance or repair'],
            ['name' => 'Retired', 'code' => 'retired', 'category' => 'asset', 'color' => '#6c757d', 'description' => 'Asset is retired from service'],
            ['name' => 'Broken', 'code' => 'broken', 'category' => 'asset', 'color' => '#dc3545', 'description' => 'Asset is broken and non-functional'],
            ['name' => 'Lost', 'code' => 'lost', 'category' => 'asset', 'color' => '#e83e8c', 'description' => 'Asset is lost or missing'],
            ['name' => 'In Transit', 'code' => 'in_transit', 'category' => 'asset', 'color' => '#17a2b8', 'description' => 'Asset is being transferred'],
            ['name' => 'Reserved', 'code' => 'reserved', 'category' => 'asset', 'color' => '#20c997', 'description' => 'Asset is reserved for future assignment'],
            
            // General statuses
            ['name' => 'Active', 'code' => 'active', 'category' => 'general', 'color' => '#28a745', 'description' => 'Item is active'],
            ['name' => 'Inactive', 'code' => 'inactive', 'category' => 'general', 'color' => '#6c757d', 'description' => 'Item is inactive'],
        ];

        foreach ($statuses as $status) {
            Status::create(array_merge($status, [
                'is_active' => true,
                'created_by' => 1,
            ]));
        }

        $this->command->info('  ✓ Statuses seeded (10 statuses)');
    }

    /**
     * Seed sample asset models
     */
    private function seedAssetModels(): void
    {
        // Get asset types
        $laptopType = AssetType::where('code', 'laptop')->first();
        $desktopType = AssetType::where('code', 'desktop')->first();
        $monitorType = AssetType::where('code', 'monitor')->first();
        $printerType = AssetType::where('code', 'printer')->first();
        $networkType = AssetType::where('code', 'network_device')->first();

        $models = [
            // Laptops
            ['asset_model' => 'Dell Latitude 7490', 'asset_type_id' => $laptopType->id, 'manufacturer_id' => 1, 'part_number' => 'LAT-7490-i7'],
            ['asset_model' => 'Dell Latitude 5420', 'asset_type_id' => $laptopType->id, 'manufacturer_id' => 1, 'part_number' => 'LAT-5420-i5'],
            ['asset_model' => 'HP ProBook 450 G8', 'asset_type_id' => $laptopType->id, 'manufacturer_id' => 2, 'part_number' => 'PB-450-G8'],
            ['asset_model' => 'HP EliteBook 840 G8', 'asset_type_id' => $laptopType->id, 'manufacturer_id' => 2, 'part_number' => 'EB-840-G8'],
            ['asset_model' => 'Lenovo ThinkPad X1 Carbon Gen 9', 'asset_type_id' => $laptopType->id, 'manufacturer_id' => 3, 'part_number' => 'TP-X1C-G9'],
            ['asset_model' => 'Lenovo ThinkPad T14 Gen 2', 'asset_type_id' => $laptopType->id, 'manufacturer_id' => 3, 'part_number' => 'TP-T14-G2'],

            // Desktops
            ['asset_model' => 'Dell OptiPlex 7090', 'asset_type_id' => $desktopType->id, 'manufacturer_id' => 1, 'part_number' => 'OPT-7090-MT'],
            ['asset_model' => 'Dell Precision 3650', 'asset_type_id' => $desktopType->id, 'manufacturer_id' => 1, 'part_number' => 'PRE-3650-T'],
            ['asset_model' => 'HP EliteDesk 800 G6', 'asset_type_id' => $desktopType->id, 'manufacturer_id' => 2, 'part_number' => 'ED-800-G6'],
            ['asset_model' => 'Lenovo ThinkCentre M75q', 'asset_type_id' => $desktopType->id, 'manufacturer_id' => 3, 'part_number' => 'TC-M75Q-G2'],

            // Monitors
            ['asset_model' => 'Dell UltraSharp U2720Q', 'asset_type_id' => $monitorType->id, 'manufacturer_id' => 1, 'part_number' => 'U2720Q-27'],
            ['asset_model' => 'HP E24 G4 Monitor', 'asset_type_id' => $monitorType->id, 'manufacturer_id' => 2, 'part_number' => 'E24-G4-24'],
            ['asset_model' => 'LG 27UK850-W', 'asset_type_id' => $monitorType->id, 'manufacturer_id' => 4, 'part_number' => 'LG-27UK850'],

            // Printers
            ['asset_model' => 'HP LaserJet Pro M404dn', 'asset_type_id' => $printerType->id, 'manufacturer_id' => 2, 'part_number' => 'LJ-M404DN'],
            ['asset_model' => 'HP Color LaserJet Pro MFP M479fdw', 'asset_type_id' => $printerType->id, 'manufacturer_id' => 2, 'part_number' => 'CLJ-M479FDW'],

            // Network Devices
            ['asset_model' => 'Cisco Catalyst 2960-X', 'asset_type_id' => $networkType->id, 'manufacturer_id' => 5, 'part_number' => 'WS-C2960X-24TS-L'],
            ['asset_model' => 'TP-Link Archer AX6000', 'asset_type_id' => $networkType->id, 'manufacturer_id' => 6, 'part_number' => 'ARCHER-AX6000'],
        ];

        foreach ($models as $model) {
            AssetModel::create(array_merge($model, [
                'created_by' => 1,
            ]));
        }

        $this->command->info('  ✓ Asset models seeded (17 models)');
    }

    /**
     * Seed sample assets for testing
     */
    private function seedSampleAssets(): void
    {
        // Get first asset model and available status
        $assetModel = AssetModel::first();
        $availableStatus = Status::where('code', 'available')->first();
        $assignedStatus = Status::where('code', 'assigned')->first();

        if (!$assetModel || !$availableStatus || !$assignedStatus) {
            $this->command->warn('  ⚠ Skipping sample assets - missing dependencies');
            return;
        }

        // Create 10 available assets
        Asset::factory()->count(10)->create([
            'model_id' => $assetModel->id,
            'status_id' => $availableStatus->id,
            'assigned_to' => null,
            'created_by' => 1,
        ]);

        // Create 5 assigned assets
        Asset::factory()->count(5)->create([
            'model_id' => $assetModel->id,
            'status_id' => $assignedStatus->id,
            'assigned_to' => 2, // Assuming user ID 2 exists
            'created_by' => 1,
        ]);

        $this->command->info('  ✓ Sample assets seeded (15 assets)');
    }
}
