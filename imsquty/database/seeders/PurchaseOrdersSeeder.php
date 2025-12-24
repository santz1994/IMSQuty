<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use App\Models\User;

/**
 * PurchaseOrdersSeeder
 * 
 * Imports purchase orders from legacy monolith
 * to financial-service microservice
 * 
 * Tracks purchase orders for asset acquisitions
 * 
 * Field mapping:
 * - po_number → po_number
 * - supplier_id → supplier_id (lookup)
 * - po_date → po_date
 * - delivery_date → expected_delivery_date
 * - amount → total_amount
 * - tax_amount → tax_amount
 * - status → status (Draft, Issued, Received, Invoiced, Cancelled)
 * - created_by_id → created_by_user_id (lookup)
 * - approved_by_id → approved_by_user_id (lookup)
 * - received_by_id → received_by_user_id (lookup)
 * 
 * Usage:
 *   php artisan db:seed --class=PurchaseOrdersSeeder
 */
class PurchaseOrdersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (PurchaseOrder::count() > 0) {
            $this->command->warn('Purchase Orders table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyPOs = $this->fetchLegacyPurchaseOrders();
            
            if (empty($legacyPOs)) {
                $this->command->info('No legacy purchase orders found.');
                return;
            }

            $this->command->info("Importing " . count($legacyPOs) . " purchase orders...\n");

            // Build lookup maps
            $supplierMap = Supplier::pluck('id', 'code')->toArray();
            $userMap = User::pluck('id', 'email')->toArray();

            $inserted = 0;
            $failed = 0;

            foreach ($legacyPOs as $legacyPO) {
                try {
                    // Map supplier
                    $supplierId = $supplierMap[$legacyPO->supplier_code] ?? null;
                    if (!$supplierId) {
                        // Try to find first supplier
                        $supplierId = Supplier::first()?->id;
                    }

                    // Map users
                    $createdByUserId = $legacyPO->created_by_email 
                        ? $userMap[$legacyPO->created_by_email] ?? null 
                        : null;

                    $approvedByUserId = $legacyPO->approved_by_email 
                        ? $userMap[$legacyPO->approved_by_email] ?? null 
                        : null;

                    $receivedByUserId = $legacyPO->received_by_email 
                        ? $userMap[$legacyPO->received_by_email] ?? null 
                        : null;

                    $totalAmount = ($legacyPO->amount ?? 0) + ($legacyPO->tax_amount ?? 0);

                    PurchaseOrder::create([
                        'po_number' => $legacyPO->po_number,
                        'supplier_id' => $supplierId,
                        'created_by_user_id' => $createdByUserId,
                        'approved_by_user_id' => $approvedByUserId,
                        'received_by_user_id' => $receivedByUserId,
                        'po_date' => $legacyPO->po_date ?? now()->date,
                        'expected_delivery_date' => $legacyPO->delivery_date ?? now()->addDays(14)->date,
                        'actual_delivery_date' => $legacyPO->actual_delivery_date,
                        'description' => $legacyPO->description ?? null,
                        'item_amount' => $legacyPO->amount ?? 0.00,
                        'tax_amount' => $legacyPO->tax_amount ?? 0.00,
                        'total_amount' => $totalAmount,
                        'status' => $legacyPO->status ?? 'Draft',
                        'notes' => $legacyPO->notes ?? null,
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ PO {$legacyPO->po_number} - {$totalAmount}");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import purchase order: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Purchase Orders Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Purchase Orders seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch purchase orders from legacy database
     */
    private function fetchLegacyPurchaseOrders()
    {
        try {
            return DB::connection('mysql')
                ->table('itquty.purchase_orders')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.purchase_orders: {$e->getMessage()}");
            return [];
        }
    }
}
