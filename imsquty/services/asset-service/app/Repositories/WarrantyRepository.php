<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class WarrantyRepository
{
    /**
     * Get warranty information from assets table
     */
    public function getByAssetId(int $assetId): ?object
    {
        return DB::table('assets')
            ->select([
                'id',
                'asset_tag',
                'name',
                'warranty_start_date',
                'warranty_end_date',
                'warranty_duration_months',
                'warranty_provider',
                'warranty_type_id',
            ])
            ->where('id', $assetId)
            ->first();
    }

    /**
     * Get assets with expiring warranty
     */
    public function getExpiring(int $daysThreshold = 30): Collection
    {
        return DB::table('assets')
            ->select([
                'id',
                'asset_tag',
                'name',
                'warranty_start_date',
                'warranty_end_date',
                'warranty_duration_months',
                'warranty_provider',
                'warranty_type_id',
            ])
            ->whereNotNull('warranty_end_date')
            ->whereDate('warranty_end_date', '>', Carbon::now())
            ->whereDate('warranty_end_date', '<=', Carbon::now()->addDays($daysThreshold))
            ->orderBy('warranty_end_date', 'asc')
            ->get();
    }

    /**
     * Get expired warranties
     */
    public function getExpired(): Collection
    {
        return DB::table('assets')
            ->select([
                'id',
                'asset_tag',
                'name',
                'warranty_start_date',
                'warranty_end_date',
                'warranty_duration_months',
                'warranty_provider',
                'warranty_type_id',
            ])
            ->whereNotNull('warranty_end_date')
            ->whereDate('warranty_end_date', '<', Carbon::now())
            ->orderBy('warranty_end_date', 'desc')
            ->get();
    }

    /**
     * Get active warranties
     */
    public function getActive(): Collection
    {
        return DB::table('assets')
            ->select([
                'id',
                'asset_tag',
                'name',
                'warranty_start_date',
                'warranty_end_date',
                'warranty_duration_months',
                'warranty_provider',
                'warranty_type_id',
            ])
            ->whereNotNull('warranty_end_date')
            ->whereDate('warranty_end_date', '>', Carbon::now())
            ->orderBy('warranty_end_date', 'asc')
            ->get();
    }

    /**
     * Get warranty statistics
     */
    public function getStatistics(): array
    {
        $total = DB::table('assets')->whereNotNull('warranty_end_date')->count();
        
        $active = DB::table('assets')
            ->whereNotNull('warranty_end_date')
            ->whereDate('warranty_end_date', '>', Carbon::now())
            ->count();
        
        $expiring = DB::table('assets')
            ->whereNotNull('warranty_end_date')
            ->whereDate('warranty_end_date', '>', Carbon::now())
            ->whereDate('warranty_end_date', '<=', Carbon::now()->addDays(30))
            ->count();
        
        $expired = DB::table('assets')
            ->whereNotNull('warranty_end_date')
            ->whereDate('warranty_end_date', '<', Carbon::now())
            ->count();

        return [
            'total' => $total,
            'active' => $active,
            'expiring_soon' => $expiring,
            'expired' => $expired,
        ];
    }

    /**
     * Update warranty information for an asset
     */
    public function updateWarranty(int $assetId, array $data): bool
    {
        return DB::table('assets')
            ->where('id', $assetId)
            ->update([
                'warranty_start_date' => $data['warranty_start_date'] ?? null,
                'warranty_end_date' => $data['warranty_end_date'] ?? null,
                'warranty_duration_months' => $data['warranty_duration_months'] ?? null,
                'warranty_provider' => $data['warranty_provider'] ?? null,
                'warranty_type_id' => $data['warranty_type_id'] ?? null,
                'updated_at' => Carbon::now(),
            ]);
    }

    /**
     * Check if warranty is valid for a specific asset
     */
    public function isWarrantyValid(int $assetId): bool
    {
        $asset = DB::table('assets')
            ->select('warranty_end_date')
            ->where('id', $assetId)
            ->first();

        if (!$asset || !$asset->warranty_end_date) {
            return false;
        }

        return Carbon::parse($asset->warranty_end_date)->isFuture();
    }
}
