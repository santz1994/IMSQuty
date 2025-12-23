<?php

namespace App\Repositories;

use App\Models\Asset;
use Illuminate\Pagination\LengthAwarePaginator;

class AssetRepository
{
    public function create(array $data): Asset
    {
        return Asset::create($data);
    }

    public function findById(int $id, bool $withTrashed = false): ?Asset
    {
        $query = Asset::query();
        if ($withTrashed) $query->withTrashed();
        return $query->find($id);
    }

    public function findByQrCode(string $qrCode): ?Asset
    {
        return Asset::where('qr_code', $qrCode)->first();
    }

    public function findByAssetTag(string $assetTag): ?Asset
    {
        return Asset::where('asset_tag', strtoupper($assetTag))->first();
    }

    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Asset::query();

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['status_id'])) {
            $query->where('status_id', $filters['status_id']);
        }

        if (!empty($filters['location_id'])) {
            $query->where('location_id', $filters['location_id']);
        }

        if (!empty($filters['model_id'])) {
            $query->where('model_id', $filters['model_id']);
        }

        if (!empty($filters['assigned_to'])) {
            $query->where('assigned_to', $filters['assigned_to']);
        }

        if (isset($filters['is_assigned'])) {
            if ($filters['is_assigned']) {
                $query->whereNotNull('assigned_to');
            } else {
                $query->whereNull('assigned_to');
            }
        }

        return $query->paginate($perPage);
    }

    public function update(int $id, array $data): Asset
    {
        $asset = $this->findById($id);
        if (!$asset) throw new \Exception("Asset not found");
        $asset->update($data);
        return $asset;
    }

    public function delete(int $id): bool
    {
        $asset = $this->findById($id);
        if (!$asset) throw new \Exception("Asset not found");
        return $asset->delete();
    }

    public function restore(int $id): bool
    {
        $asset = Asset::withTrashed()->find($id);
        if (!$asset) throw new \Exception("Asset not found");
        return $asset->restore();
    }

    public function assetTagExists(string $assetTag): bool
    {
        return Asset::where('asset_tag', $assetTag)->exists();
    }

    public function count(): int
    {
        return Asset::count();
    }

    public function countAssigned(): int
    {
        return Asset::whereNotNull('user_id')->count();
    }

    public function countMaintenance(): int
    {
        return Asset::where('status', 'maintenance')->count();
    }

    public function countDisposal(): int
    {
        return Asset::where('status', 'disposal')->count();
    }

    public function getExpiringWarranties(int $days = 30): LengthAwarePaginator
    {
        $expiryDate = now()->addDays($days)->toDateString();
        return Asset::whereNotNull('warranty_expiry_date')
            ->where('warranty_expiry_date', '<=', $expiryDate)
            ->paginate(15);
    }

    public function getStatusCounts(): array
    {
        // Group assets by status_id and count them
        $counts = [];
        $results = Asset::groupBy('status_id')
            ->selectRaw('status_id, COUNT(*) as count')
            ->get();
        
        foreach ($results as $result) {
            $counts[$result->status_id] = $result->count;
        }
        
        return $counts;
    }

    public function getTotalValue(): float
    {
        return Asset::sum('purchase_price') ?? 0.0;
    }
}
