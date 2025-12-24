<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\AssetModel;
use App\Models\AssetType;

/**
 * AssetModelsSeeder
 * 
 * Imports asset models/specifications from legacy monolith
 * to microservices
 * 
 * Usage:
 *   php artisan db:seed --class=AssetModelsSeeder
 */
class AssetModelsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (AssetModel::count() > 0) {
            $this->command->warn('Asset Models table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyAssetModels = $this->fetchLegacyAssetModels();
            
            if (empty($legacyAssetModels)) {
                $this->command->info('No legacy asset models found.');
                return;
            }

            $this->command->info("Importing " . count($legacyAssetModels) . " asset models...\n");

            // Build asset type ID map
            $typeMap = AssetType::pluck('id', 'code')->toArray();

            $inserted = 0;
            $failed = 0;

            foreach ($legacyAssetModels as $legacyModel) {
                try {
                    // Map asset type
                    $typeCode = $legacyModel->type_code ?? 'COMP';
                    $assetTypeId = $typeMap[$typeCode] ?? AssetType::where('code', 'COMP')->first()?->id ?? 1;

                    AssetModel::create([
                        'asset_type_id' => $assetTypeId,
                        'name' => $legacyModel->model_name ?? $legacyModel->name,
                        'code' => $legacyModel->model_code ?? $legacyModel->code,
                        'manufacturer' => $legacyModel->manufacturer ?? null,
                        'description' => $legacyModel->description ?? null,
                        'is_active' => $legacyModel->is_active ?? true,
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ {$legacyModel->model_name} ({$typeCode})");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import asset model: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Asset Models Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Asset Models seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch asset models from legacy database
     */
    private function fetchLegacyAssetModels()
    {
        try {
            return DB::connection('mysql')
                ->table('itquty.asset_models')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.asset_models: {$e->getMessage()}");
            return $this->getDefaultAssetModels();
        }
    }

    /**
     * Default asset models (fallback)
     */
    private function getDefaultAssetModels(): array
    {
        return [
            (object)[
                'id' => 1,
                'model_name' => 'Dell OptiPlex 7090',
                'model_code' => 'DELL-OP7090',
                'type_code' => 'COMP',
                'manufacturer' => 'Dell',
                'description' => 'Desktop Computer - Intel Core i7',
                'is_active' => true,
            ],
            (object)[
                'id' => 2,
                'model_name' => 'HP LaserJet Pro M404',
                'model_code' => 'HP-LJ404',
                'type_code' => 'PRINT',
                'manufacturer' => 'HP',
                'description' => 'Network Printer',
                'is_active' => true,
            ],
            (object)[
                'id' => 3,
                'model_name' => 'Cisco Catalyst 2960',
                'model_code' => 'CISCO-C2960',
                'type_code' => 'NET',
                'manufacturer' => 'Cisco',
                'description' => 'Managed Network Switch',
                'is_active' => true,
            ],
            (object)[
                'id' => 4,
                'model_name' => 'Dell PowerEdge R750',
                'model_code' => 'DELL-PE750',
                'type_code' => 'SERV',
                'manufacturer' => 'Dell',
                'description' => 'Rack Server - 2U',
                'is_active' => true,
            ],
        ];
    }
}
