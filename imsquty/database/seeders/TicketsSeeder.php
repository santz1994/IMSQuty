<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Ticket;
use App\Models\Asset;
use App\Models\User;

/**
 * TicketsSeeder
 * 
 * Imports IT support tickets from legacy monolith
 * to ticket-service microservice
 * 
 * Tracks IT support requests, issues, and resolutions
 * 
 * Field mapping:
 * - ticket_number → ticket_number
 * - asset_id → asset_id (lookup, optional)
 * - reported_by_id → reported_by_user_id (lookup)
 * - assigned_to_id → assigned_to_user_id (lookup, optional)
 * - category → category
 * - priority → priority (Low, Medium, High, Critical)
 * - status → status (Open, In Progress, Resolved, Closed)
 * - created_at → created_at
 * - closed_at → closed_at
 * 
 * Usage:
 *   php artisan db:seed --class=TicketsSeeder
 */
class TicketsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Prevent duplicate execution
        if (Ticket::count() > 0) {
            $this->command->warn('Tickets table already populated. Skipping migration.');
            return;
        }

        try {
            $legacyTickets = $this->fetchLegacyTickets();
            
            if (empty($legacyTickets)) {
                $this->command->info('No legacy tickets found.');
                return;
            }

            $this->command->info("Importing " . count($legacyTickets) . " IT support tickets...\n");

            // Build lookup maps
            $assetMap = Asset::pluck('id', 'asset_code')->toArray();
            $userMap = User::pluck('id', 'email')->toArray();

            $inserted = 0;
            $failed = 0;

            foreach ($legacyTickets as $legacyTicket) {
                try {
                    // Map reporting user
                    $reportedByUserId = $userMap[$legacyTicket->reported_by_email] ?? null;
                    if (!$reportedByUserId) {
                        continue; // Skip if reporting user not found
                    }

                    // Map asset (optional)
                    $assetId = $legacyTicket->asset_code 
                        ? $assetMap[$legacyTicket->asset_code] ?? null 
                        : null;

                    // Map assigned user (optional)
                    $assignedToUserId = $legacyTicket->assigned_to_email 
                        ? $userMap[$legacyTicket->assigned_to_email] ?? null 
                        : null;

                    Ticket::create([
                        'ticket_number' => $legacyTicket->ticket_number,
                        'asset_id' => $assetId,
                        'reported_by_user_id' => $reportedByUserId,
                        'assigned_to_user_id' => $assignedToUserId,
                        'category' => $legacyTicket->category ?? 'General',
                        'priority' => $legacyTicket->priority ?? 'Medium',
                        'status' => $legacyTicket->status ?? 'Open',
                        'title' => $legacyTicket->title,
                        'description' => $legacyTicket->description,
                        'resolution' => $legacyTicket->resolution ?? null,
                        'created_at' => $legacyTicket->created_at ?? now(),
                        'closed_at' => $legacyTicket->closed_at,
                    ]);
                    
                    $inserted++;
                    $this->command->line("  ✓ Ticket #{$legacyTicket->ticket_number} - {$legacyTicket->status}");
                    
                } catch (\Exception $e) {
                    $failed++;
                    $this->command->error("  ✗ Failed to import ticket: {$e->getMessage()}");
                }
            }

            // Summary
            $this->command->info("\n" . str_repeat('=', 60));
            $this->command->info("Tickets Import Summary:");
            $this->command->line("  ✓ Imported: $inserted");
            $this->command->line("  ✗ Failed: $failed");
            $this->command->info(str_repeat('=', 60));

        } catch (\Exception $e) {
            $this->command->error("Tickets seeding failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Fetch tickets from legacy database
     */
    private function fetchLegacyTickets()
    {
        try {
            return DB::connection('mysql')
                ->table('itquty.tickets')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            $this->command->warn("Could not fetch from itquty.tickets: {$e->getMessage()}");
            return [];
        }
    }
}
