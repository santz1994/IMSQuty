<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Supplier;

/**
 * SuppliersSeeder
 * 
 * Imports suppliers from legacy monolith (itquty.suppliers)
 * to microservices (imsquty.suppliers)
 * 
 * Created in Phase 1 Decision #2
 * 
 * Usage:
 *   php artisan db:seed --class=SuppliersSeeder
 */
class SuppliersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (Supplier::count() > 0) {
            $this->command->warn('Suppliers table already populated. Skipping migration.');
            return;
        }

        try {
            $legacySuppliers = $this->fetchLegacySuppliers();
            
            if (empty($legacySuppliers)) {
                $this->command->info('No legacy suppliers found.');
                return;
            }

            $this->command->info("Importing " . count($legacySuppliers) . " suppliers...\n");

            $inserted = 0;
            $failed = 0;

            foreach ($legacySuppliers as $legacySup) {
                try {
                    // Field mapping (use correct schema)
                    DB::table('suppliers')->insert([
                        'name' => $legacySup->supplier_name ?? $legacySup->name,
                        'code' => $legacySup->supplier_code ?? $legacySup->code ?? null,
                        'contact_email' => $legacySup->email ?? $legacySup->contact_email ?? null,
                        'contact_phone' => $legacySup->phone ?? $legacySup->contact_phone ?? null,
                        'address' => $legacySup->address ?? null,
                        'city' => $legacySup->city ?? null,
                        'state' => $legacySup->state ?? null,
                        'country' => $legacySup->country ?? null,
                        'postal_code' => $legacySup->postal_code ?? null,
                        'notes' => $legacySup->notes ?? $legacySup->description ?? null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ {$legacySup->supplier_name}");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import supplier: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Suppliers Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Suppliers seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch suppliers from legacy database
     */
    private function fetchLegacySuppliers()
    {
        try {
            return DB::connection('mysql')
                ->table('itquty.suppliers')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.suppliers: {$e->getMessage()}");
            return $this->getDefaultSuppliers();
        }
    }

    /**
     * Default suppliers (fallback if legacy DB unavailable)
     */
    private function getDefaultSuppliers(): array
    {
        return [
            (object)[
                'id' => 1,
                'supplier_name' => 'Tech Supplies Inc',
                'supplier_code' => 'TS-001',
                'contact_person' => 'John Doe',
                'phone' => '+1-800-111-2222',
                'email' => 'sales@techsupplies.com',
                'address' => '123 Tech Street',
                'city' => 'San Jose',
                'state' => 'CA',
                'country' => 'USA',
                'postal_code' => '95112',
                'website' => 'www.techsupplies.com',
                'description' => 'IT Hardware Supplier',
                'is_active' => true,
            ],
            (object)[
                'id' => 2,
                'supplier_name' => 'Software Solutions Ltd',
                'supplier_code' => 'SS-001',
                'contact_person' => 'Jane Smith',
                'phone' => '+1-800-333-4444',
                'email' => 'sales@softwaresolutions.com',
                'address' => '456 Software Ave',
                'city' => 'Seattle',
                'state' => 'WA',
                'country' => 'USA',
                'postal_code' => '98101',
                'website' => 'www.softwaresolutions.com',
                'description' => 'Software Vendor',
                'is_active' => true,
            ],
        ];
    }
}
