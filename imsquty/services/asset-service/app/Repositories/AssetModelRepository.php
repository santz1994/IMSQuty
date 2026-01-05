<?php

namespace App\Repositories;

use App\Models\AssetModel;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Shared\Repositories\BaseRepository;

/**
 * AssetModel Repository
 * 
 * Handles all database interactions for the AssetModel model.
 * Implements data access layer following Repository pattern.
 */
class AssetModelRepository extends BaseRepository
{
    /**
     * Specify Model class name
     *
     * @return string
     */
    protected function model(): string
    {
        return AssetModel::class;
    }

    /**
     * Get all asset models (no pagination)
     *
     * @return Collection
     */
    public function getAllModels(): Collection
    {
        return AssetModel::with(['assetType', 'manufacturer'])
            ->orderBy('asset_model')
            ->get();
    }

    /**
     * Get asset models by type
     *
     * @param int $assetTypeId
     * @return Collection
     */
    public function getByType(int $assetTypeId): Collection
    {
        return AssetModel::where('asset_type_id', $assetTypeId)
            ->with(['manufacturer', 'pcspec'])
            ->orderBy('asset_model')
            ->get();
    }

    /**
     * Get asset models by manufacturer
     *
     * @param int $manufacturerId
     * @return Collection
     */
    public function getByManufacturer(int $manufacturerId): Collection
    {
        return AssetModel::where('manufacturer_id', $manufacturerId)
            ->with(['assetType', 'pcspec'])
            ->orderBy('asset_model')
            ->get();
    }

    /**
     * Check if asset model name exists
     *
     * @param string $name
     * @param int|null $excludeId
     * @return bool
     */
    public function modelNameExists(string $name, ?int $excludeId = null): bool
    {
        $query = AssetModel::where('asset_model', $name);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        
        return $query->exists();
    }

    /**
     * Get asset models with asset counts
     *
     * @return Collection
     */
    public function getWithAssetCounts(): Collection
    {
        return AssetModel::withCount('assets')
            ->with(['assetType', 'manufacturer'])
            ->orderBy('asset_model')
            ->get();
    }
}
