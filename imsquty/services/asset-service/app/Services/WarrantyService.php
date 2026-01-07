<?php

namespace App\Services;

use App\Repositories\WarrantyRepository;
use App\DTOs\WarrantyDTO;
use Illuminate\Database\Eloquent\Collection;

class WarrantyService
{
    protected WarrantyRepository $warrantyRepository;

    public function __construct(WarrantyRepository $warrantyRepository)
    {
        $this->warrantyRepository = $warrantyRepository;
    }

    /**
     * Get warranty information for an asset
     */
    public function getByAssetId(int $assetId): ?object
    {
        $warranty = $this->warrantyRepository->getByAssetId($assetId);
        
        if (!$warranty) {
            return null;
        }

        // Add computed fields
        $warranty->is_expired = $warranty->warranty_end_date 
            ? \Carbon\Carbon::parse($warranty->warranty_end_date)->isPast()
            : null;
        
        $warranty->is_expiring_soon = $warranty->warranty_end_date 
            ? \Carbon\Carbon::parse($warranty->warranty_end_date)->isBetween(now(), now()->addDays(30))
            : false;
        
        $warranty->days_remaining = $warranty->warranty_end_date 
            ? \Carbon\Carbon::parse($warranty->warranty_end_date)->diffInDays(now())
            : null;

        return $warranty;
    }

    /**
     * Get assets with expiring warranty
     */
    public function getExpiring(int $daysThreshold = 30): Collection
    {
        return $this->warrantyRepository->getExpiring($daysThreshold);
    }

    /**
     * Get expired warranties
     */
    public function getExpired(): Collection
    {
        return $this->warrantyRepository->getExpired();
    }

    /**
     * Get active warranties
     */
    public function getActive(): Collection
    {
        return $this->warrantyRepository->getActive();
    }

    /**
     * Get warranty statistics
     */
    public function getStatistics(): array
    {
        return $this->warrantyRepository->getStatistics();
    }

    /**
     * Update warranty information
     */
    public function updateWarranty(int $assetId, WarrantyDTO $dto): bool
    {
        $data = [
            'warranty_start_date' => $dto->start_date,
            'warranty_end_date' => $dto->calculateExpiryDate(),
            'warranty_duration_months' => $dto->warranty_months,
            'warranty_provider' => $dto->provider,
            'warranty_type_id' => $dto->warranty_type_id,
        ];

        return $this->warrantyRepository->updateWarranty($assetId, $data);
    }

    /**
     * Check if warranty is valid
     */
    public function isWarrantyValid(int $assetId): bool
    {
        return $this->warrantyRepository->isWarrantyValid($assetId);
    }

    /**
     * Get warranty expiry alerts
     */
    public function getExpiryAlerts(int $daysThreshold = 30): array
    {
        $expiring = $this->getExpiring($daysThreshold);
        
        return [
            'critical' => $expiring->filter(function($asset) {
                return \Carbon\Carbon::parse($asset->warranty_end_date)->diffInDays(now()) <= 7;
            })->values(),
            'warning' => $expiring->filter(function($asset) {
                $days = \Carbon\Carbon::parse($asset->warranty_end_date)->diffInDays(now());
                return $days > 7 && $days <= 30;
            })->values(),
            'total' => $expiring->count(),
        ];
    }
}
