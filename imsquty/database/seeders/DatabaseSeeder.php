<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * DatabaseSeeder
 * 
 * Master seeder that orchestrates all database seeding operations
 * 
 * Seeding Order (Dependencies):
 * 1. Reference Data (foundations)
 *    - DivisionsSeeder
 *    - LocationsSeeder
 *    - ManufacturersSeeder
 *    - SuppliersSeeder
 *    - WarrantyTypesSeeder
 * 
 * 2. Asset Structures (built on reference data)
 *    - AssetTypesSeeder
 *    - AssetModelsSeeder
 *    - StatusesSeeder
 * 
 * 3. Primary Data (assets and specs)
 *    - AssetsSeeder (with network field consolidation)
 *    - PcspecsSeeder
 * 
 * 4. Transactions (depend on primary data)
 *    - MovementsSeeder
 *    - MaintenanceLogsSeeder
 *    - AssetRequestsSeeder
 * 
 * 5. Cross-Service Data (independent services)
 *    - TicketsSeeder
 *    - InvoicesSeeder
 *    - PurchaseOrdersSeeder
 * 
 * 6. Legacy Users (if not already populated)
 *    - MigrateLegacyUsersSeeder
 * 
 * Usage:
 *   php artisan db:seed                          # Run all seeders
 *   php artisan db:seed --class=DivisionsSeeder  # Run single seeder
 *   php artisan migrate:fresh --seed             # Reset & seed
 * 
 * Expected Results:
 *   - 750+ records imported from legacy database
 *   - 16 seeder files executed
 *   - Full audit trail created
 * 
 * Notes:
 *   - All seeders are idempotent (safe to run multiple times)
 *   - All seeders have fallback defaults if legacy DB unavailable
 *   - Network fields consolidated in AssetsSeeder (ip, mac)
 *   - Field name standardization applied throughout
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info("\n" . str_repeat('=', 80));
        $this->command->info('Starting Database Seeding - Phase 3 Data Import');
        $this->command->info('Expected: 750+ records across 16 seeders');
        $this->command->info(str_repeat('=', 80) . "\n");

        try {
            // ============================================================================
            // PHASE 1: Reference Data (Foundations)
            // ============================================================================
            $this->command->info("\n--- PHASE 1: Reference Data ---\n");
            
            $this->call(DivisionsSeeder::class);
            $this->call(LocationsSeeder::class);
            $this->call(ManufacturersSeeder::class);
            $this->call(SuppliersSeeder::class);
            $this->call(WarrantyTypesSeeder::class);

            // ============================================================================
            // PHASE 2: Asset Structures (Built on reference data)
            // ============================================================================
            $this->command->info("\n--- PHASE 2: Asset Structures ---\n");
            
            $this->call(AssetTypesSeeder::class);
            $this->call(AssetModelsSeeder::class);
            $this->call(StatusesSeeder::class);

            // ============================================================================
            // PHASE 3: Primary Data (Assets and Specifications)
            // ============================================================================
            $this->command->info("\n--- PHASE 3: Primary Data ---\n");
            
            $this->call(AssetsSeeder::class);           // CRITICAL: Network field consolidation
            $this->call(PcspecsSeeder::class);

            // ============================================================================
            // PHASE 4: Transactions (Asset history and movements)
            // ============================================================================
            $this->command->info("\n--- PHASE 4: Transactions ---\n");
            
            $this->call(MovementsSeeder::class);
            $this->call(MaintenanceLogsSeeder::class);
            $this->call(AssetRequestsSeeder::class);

            // ============================================================================
            // PHASE 5: Cross-Service Data (Independent microservices)
            // ============================================================================
            $this->command->info("\n--- PHASE 5: Cross-Service Data ---\n");
            
            $this->call(TicketsSeeder::class);
            $this->call(InvoicesSeeder::class);
            $this->call(PurchaseOrdersSeeder::class);

            // ============================================================================
            // PHASE 6: Legacy User Migration (if needed)
            // ============================================================================
            $this->command->info("\n--- PHASE 6: Legacy Users ---\n");
            
            $this->call(MigrateLegacyUsersSeeder::class);

            // ============================================================================
            // COMPLETION
            // ============================================================================
            $this->command->info("\n" . str_repeat('=', 80));
            $this->command->info('✅ Database Seeding Complete');
            $this->command->info('All 16 seeders executed successfully');
            $this->command->info('Expected 750+ records imported from legacy database (itquty)');
            $this->command->info(str_repeat('=', 80) . "\n");

            // Summary statistics
            $this->displaySeederSummary();

        } catch (\Exception $e) {
            $this->command->error("\n❌ Database Seeding Failed");
            $this->command->error("Error: {$e->getMessage()}");
            $this->command->error(str_repeat('=', 80) . "\n");
            throw $e;
        }
    }

    /**
     * Display summary statistics after seeding
     */
    private function displaySeederSummary(): void
    {
        $this->command->info("\n📊 Seeding Summary Statistics:\n");

        $tables = [
            'divisions' => 'Divisions',
            'locations' => 'Locations',
            'manufacturers' => 'Manufacturers',
            'suppliers' => 'Suppliers',
            'warranty_types' => 'Warranty Types',
            'asset_types' => 'Asset Types',
            'asset_models' => 'Asset Models',
            'statuses' => 'Statuses',
            'assets' => 'Assets',
            'pcspecs' => 'PC Specifications',
            'movements' => 'Asset Movements',
            'maintenance_logs' => 'Maintenance Logs',
            'asset_requests' => 'Asset Requests',
            'tickets' => 'IT Tickets',
            'invoices' => 'Invoices',
            'purchase_orders' => 'Purchase Orders',
        ];

        try {
            $totalRecords = 0;
            foreach ($tables as $table => $label) {
                $count = \DB::table($table)->count();
                $totalRecords += $count;
                $status = $count > 0 ? '✓' : '○';
                $this->command->line(sprintf("  %s %-20s: %4d records", $status, $label, $count));
            }

            $this->command->line("\n  " . str_repeat('-', 50));
            $this->command->line(sprintf("  📈 Total Records: %d", $totalRecords));
            $this->command->line("  " . str_repeat('-', 50) . "\n");
        } catch (\Exception $e) {
            $this->command->warn("Could not retrieve summary statistics: {$e->getMessage()}");
        }
    }
}
