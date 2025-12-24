<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Invoice;
use App\Models\Supplier;
use App\Models\User;

/**
 * InvoicesSeeder
 * 
 * Imports vendor invoices from legacy monolith
 * to financial-service microservice
 * 
 * Tracks purchase invoices and payments from suppliers
 * 
 * Field mapping:
 * - invoice_number → invoice_number
 * - supplier_id → supplier_id (lookup)
 * - invoice_date → invoice_date
 * - due_date → due_date
 * - amount → total_amount
 * - tax_amount → tax_amount
 * - paid_date → paid_at
 * - status → status (Draft, Issued, Paid, Overdue, Cancelled)
 * - created_by_id → created_by_user_id (lookup)
 * 
 * Usage:
 *   php artisan db:seed --class=InvoicesSeeder
 */
class InvoicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (Invoice::count() > 0) {
            $this->command->warn('Invoices table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyInvoices = $this->fetchLegacyInvoices();
            
            if (empty($legacyInvoices)) {
                $this->command->info('No legacy invoices found.');
                return;
            }

            $this->command->info("Importing " . count($legacyInvoices) . " invoices...\n");

            // Build lookup maps
            $supplierMap = Supplier::pluck('id', 'code')->toArray();
            $userMap = User::pluck('id', 'email')->toArray();

            $inserted = 0;
            $failed = 0;

            foreach ($legacyInvoices as $legacyInvoice) {
                try {
                    // Map supplier
                    $supplierId = $supplierMap[$legacyInvoice->supplier_code] ?? null;
                    if (!$supplierId) {
                        // Try to find first supplier
                        $supplierId = Supplier::first()?->id;
                    }

                    // Map creating user
                    $createdByUserId = $legacyInvoice->created_by_email 
                        ? $userMap[$legacyInvoice->created_by_email] ?? null 
                        : null;

                    $totalAmount = ($legacyInvoice->amount ?? 0) + ($legacyInvoice->tax_amount ?? 0);

                    Invoice::create([
                        'invoice_number' => $legacyInvoice->invoice_number,
                        'supplier_id' => $supplierId,
                        'created_by_user_id' => $createdByUserId,
                        'invoice_date' => $legacyInvoice->invoice_date ?? now()->date,
                        'due_date' => $legacyInvoice->due_date ?? now()->addDays(30)->date,
                        'description' => $legacyInvoice->description ?? null,
                        'item_amount' => $legacyInvoice->amount ?? 0.00,
                        'tax_amount' => $legacyInvoice->tax_amount ?? 0.00,
                        'total_amount' => $totalAmount,
                        'status' => $legacyInvoice->status ?? 'Issued',
                        'paid_at' => $legacyInvoice->paid_date,
                        'notes' => $legacyInvoice->notes ?? null,
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ Invoice {$legacyInvoice->invoice_number} - {$totalAmount}");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import invoice: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Invoices Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Invoices seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch invoices from legacy database
     */
    private function fetchLegacyInvoices()
    {
        try {
            return DB::connection('mysql')
                ->table('itquty.invoices')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.invoices: {$e->getMessage()}");
            return [];
        }
    }
}
