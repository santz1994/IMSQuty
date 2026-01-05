<?php

namespace App\Repositories;

use App\Models\Asset;
use Illuminate\Pagination\LengthAwarePaginator;
use Shared\Repositories\BaseRepository;

class AssetRepository extends BaseRepository
{
    /**
     * Specify Model class name
     *
     * @return string
     */
    protected function model(): string
    {
        return Asset::class;
    }

    /**
     * Find asset by QR code
     */
    public function findByQrCode(string $qrCode): ?Asset
    {
        return Asset::where('qr_code', $qrCode)->first();
    }

    /**
     * Find asset by asset tag
     */
    public function findByAssetTag(string $assetTag): ?Asset
    {
        return Asset::where('asset_tag', strtoupper($assetTag))->first();
    }

    /**
     * Check if asset tag exists
     */
    public function assetTagExists(string $assetTag): bool
    {
        return Asset::where('asset_tag', $assetTag)->exists();
    }

    /**
     * Count assigned assets
     */
    public function countAssigned(): int
    {
        return Asset::whereNotNull('user_id')->count();
    }

    /**
     * Count assets in maintenance
     */
    public function countMaintenance(): int
    {
        return Asset::where('status', 'maintenance')->count();
    }

    /**
     * Count assets for disposal
     */
    public function countDisposal(): int
    {
        return Asset::where('status', 'disposal')->count();
    }

    /**
     * Get assets with expiring warranties
     */
    public function getExpiringWarranties(int $days = 30): LengthAwarePaginator
    {
        $startDate = now()->toDateString();
        $endDate = now()->addDays($days)->toDateString();
        
        return Asset::whereNotNull('purchase_date')
            ->whereNotNull('warranty_months')
            ->whereRaw("DATE_ADD(purchase_date, INTERVAL warranty_months MONTH) BETWEEN ? AND ?", [$startDate, $endDate])
            ->paginate(15);
    }

    /**
     * Get asset counts grouped by status
     */
    public function getStatusCounts(): array
    {
        $counts = [];
        $results = Asset::groupBy('status_id')
            ->selectRaw('status_id, COUNT(*) as count')
            ->get();
        
        foreach ($results as $result) {
            $counts[$result->status_id] = $result->count;
        }
        
        return $counts;
    }

    /**
     * Get total value of assets
     * Note: Value tracking is handled by Financial Service
     */
    public function getTotalValue(): float
    {
        return 0.0;
    }
}
