<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\Movement;
use App\Repositories\AssetRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class AssetService
{
    protected $assetRepository;

    public function __construct(AssetRepository $assetRepository)
    {
        $this->assetRepository = $assetRepository;
    }

    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->assetRepository->getAll($filters, $perPage);
    }

    public function getById(int $id, bool $withTrashed = false): ?Asset
    {
        $asset = $this->assetRepository->findById($id, $withTrashed);
        if (!$asset) throw new \Exception("Asset not found");
        return $asset;
    }

    public function create(array $data): Asset
    {
        if (isset($data['asset_tag']) && $this->assetRepository->assetTagExists($data['asset_tag'])) {
            throw new \Exception("Asset tag {$data['asset_tag']} already exists.");
        }
        return $this->assetRepository->create($data);
    }

    public function update(int $id, array $data): Asset
    {
        return $this->assetRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->assetRepository->delete($id);
    }

    public function restore(int $id): bool
    {
        return $this->assetRepository->restore($id);
    }

    public function getByQRCode(string $qrCode): ?Asset
    {
        $asset = $this->assetRepository->findByQrCode($qrCode);
        if (!$asset) throw new \Exception("Asset with QR code {$qrCode} not found.");
        return $asset;
    }

    // Controller method aliases
    public function getAllAssets(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->getAll($filters, $perPage);
    }

    public function getAssetById(int $id, bool $withTrashed = false): ?Asset
    {
        return $this->getById($id, $withTrashed);
    }

    public function getAssetByQrCode(string $qrCode): ?Asset
    {
        return $this->getByQRCode($qrCode);
    }

    public function createAsset(array $data): Asset
    {
        return $this->create($data);
    }

    public function updateAsset(int $id, array $data): Asset
    {
        return $this->update($id, $data);
    }

    public function deleteAsset(int $id): bool
    {
        return $this->delete($id);
    }

    public function restoreAsset(int $id): bool
    {
        return $this->restore($id);
    }

    public function assignAsset(int $id, int $userId, array $data = []): Asset
    {
        $asset = $this->getById($id);
        
        // Get assigned status ID (assuming status_id 2 is "assigned")
        $assignedStatusId = 2;
        
        $assignData = [
            'assigned_to' => $userId,
            'status_id' => $assignedStatusId,
        ];
        
        if (!empty($data['location_id'])) {
            $assignData['location_id'] = $data['location_id'];
        }
        
        $updated = $this->update($id, $assignData);
        
        // Create movement record
        if (isset($data['location_id']) || $asset->assigned_to !== $userId) {
            Movement::create([
                'asset_id' => $id,
                'from_user_id' => $asset->assigned_to,
                'to_user_id' => $userId,
                'from_location_id' => $asset->location_id,
                'to_location_id' => $data['location_id'] ?? $asset->location_id,
                'moved_at' => now(),
                'moved_by' => auth()->id() ?? 1,
                'reason' => $data['reason'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);
        }
        
        return $updated;
    }

    public function transferAsset(int $id, array $data): Asset
    {
        $asset = $this->getById($id);
        
        $toUserId = $data['to_user_id'] ?? $asset->assigned_to;
        $toLocationId = $data['to_location_id'] ?? $asset->location_id;
        
        $transferData = [
            'assigned_to' => $toUserId,
            'location_id' => $toLocationId,
        ];
        
        $updated = $this->update($id, $transferData);
        
        // Create movement record
        Movement::create([
            'asset_id' => $id,
            'from_user_id' => $asset->assigned_to,
            'to_user_id' => $toUserId,
            'from_location_id' => $asset->location_id,
            'to_location_id' => $toLocationId,
            'moved_by' => auth()->id() ?? 1,
            'reason' => $data['reason'] ?? null,
            'notes' => $data['notes'] ?? null,
            'moved_at' => ($data['movement_date'] ?? null) ? \Carbon\Carbon::parse($data['movement_date']) : now(),
        ]);
        
        Log::info("Asset {$id} transferred from user {$asset->assigned_to} to {$toUserId}");
        return $updated;
    }

    public function getExpiringWarranties(int $days = 30): LengthAwarePaginator
    {
        return $this->assetRepository->getExpiringWarranties($days);
    }

    public function getAssetStatistics(): array
    {
        try {
            return [
                'total_assets' => $this->assetRepository->count(),
                'by_status' => $this->assetRepository->getStatusCounts() ?? [],
                'total_value' => $this->assetRepository->getTotalValue() ?? 0.0,
            ];
        } catch (\Exception $e) {
            // Fallback if methods fail
            return [
                'total_assets' => 0,
                'by_status' => [],
                'total_value' => 0.0,
            ];
        }
    }
}
