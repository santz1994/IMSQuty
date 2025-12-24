<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\AssetRequest;
use App\Models\Asset;
use App\Models\User;

/**
 * AssetRequestsSeeder
 * 
 * Imports asset requisition requests from legacy monolith
 * to microservices
 * 
 * Tracks asset allocation requests, approvals, and assignments
 * 
 * Field mapping:
 * - request_type → type (Request, Allocation, Return, etc.)
 * - requested_by_id → requested_by_user_id (lookup)
 * - approved_by_id → approved_by_user_id (lookup)
 * - asset_id → asset_id (lookup, optional)
 * - request_date → requested_at
 * - approval_date → approved_at
 * - status → status (Pending, Approved, Rejected, Assigned)
 * 
 * Usage:
 *   php artisan db:seed --class=AssetRequestsSeeder
 */
class AssetRequestsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (AssetRequest::count() > 0) {
            $this->command->warn('Asset Requests table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyRequests = $this->fetchLegacyAssetRequests();
            
            if (empty($legacyRequests)) {
                $this->command->info('No legacy asset requests found.');
                return;
            }

            $this->command->info("Importing " . count($legacyRequests) . " asset requests...\n");

            // Build lookup maps
            $assetMap = Asset::pluck('id', 'asset_code')->toArray();
            $userMap = User::pluck('id', 'email')->toArray();

            $inserted = 0;
            $failed = 0;

            foreach ($legacyRequests as $legacyRequest) {
                try {
                    // Map requesting user
                    $requestedByUserId = $userMap[$legacyRequest->requested_by_email] ?? null;
                    if (!$requestedByUserId) {
                        continue; // Skip if requesting user not found
                    }

                    // Map approving user (optional)
                    $approvedByUserId = $legacyRequest->approved_by_email 
                        ? $userMap[$legacyRequest->approved_by_email] ?? null 
                        : null;

                    // Map asset (optional - may be null for new asset requests)
                    $assetId = $legacyRequest->asset_code 
                        ? $assetMap[$legacyRequest->asset_code] ?? null 
                        : null;

                    AssetRequest::create([
                        'type' => $legacyRequest->request_type ?? 'Request',
                        'asset_id' => $assetId,
                        'requested_by_user_id' => $requestedByUserId,
                        'approved_by_user_id' => $approvedByUserId,
                        'status' => $legacyRequest->status ?? 'Pending',
                        'reason' => $legacyRequest->reason ?? null,
                        'description' => $legacyRequest->description ?? null,
                        'requested_at' => $legacyRequest->request_date ?? now(),
                        'approved_at' => $legacyRequest->approval_date,
                        'notes' => $legacyRequest->notes ?? null,
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ Request: {$legacyRequest->request_type} - {$legacyRequest->status}");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import asset request: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Asset Requests Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Asset Requests seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch asset requests from legacy database
     */
    private function fetchLegacyAssetRequests()
    {
        try {
            return DB::connection('mysql')
                ->table('itquty.asset_requests')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.asset_requests: {$e->getMessage()}");
            return [];
        }
    }
}
