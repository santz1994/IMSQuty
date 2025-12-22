<?php

namespace App\Repositories;

use App\Models\AssetModel;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * AssetModel Repository
 * 
 * Handles all database interactions for the AssetModel model.
 * Implements data access layer following Repository pattern.
 */
class AssetModelRepository
{
    /**
     * Create a new asset model
     *
     * @param array $data
     * @return AssetModel
     */
    public function create(array $data): AssetModel
    {
        return AssetModel::create($data);
    }

    /**
     * Find asset model by ID
     *
     * @param int $id
     * @param bool $withTrashed Include soft-deleted records
     * @return AssetModel|null
     */
    public function findById(int $id, bool $withTrashed = false): ?AssetModel
    {
        $query = AssetModel::query();
        
        if ($withTrashed) {
            $query->withTrashed();
        }
        
        return $query->with(['assetType', 'manufacturer', 'pcspec'])
            ->find($id);
    }

    /**
     * Get all asset models with filters and pagination
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = AssetModel::query()->with(['assetType', 'manufacturer', 'pcspec']);

        // Search filter
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        // Asset type filter
        if (!empty($filters['asset_type_id'])) {
            $query->where('asset_type_id', $filters['asset_type_id']);
        }

        // Manufacturer filter
        if (!empty($filters['manufacturer_id'])) {
            $query->where('manufacturer_id', $filters['manufacturer_id']);
        }

        // PC spec filter
        if (!empty($filters['pcspec_id'])) {
            $query->where('pcspec_id', $filters['pcspec_id']);
        }

        // Include trashed
        if (!empty($filters['with_trashed'])) {
            $query->withTrashed();
        }

        // Sorting
        $sortField = $filters['sort_by'] ?? 'asset_model';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
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
     * Update asset model
     *
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update(int $id, array $data): bool
    {
        $model = AssetModel::findOrFail($id);
        return $model->update($data);
    }

    /**
     * Soft delete asset model
     *
     * @param int $id
     * @return bool
     * @throws \Exception
     */
    public function delete(int $id): bool
    {
        $model = AssetModel::findOrFail($id);
        
        // Check if model has associated assets
        if ($model->assets()->count() > 0) {
            throw new \Exception('Cannot delete asset model with associated assets.');
        }
        
        return $model->delete();
    }

    /**
     * Restore soft-deleted asset model
     *
     * @param int $id
     * @return bool
     */
    public function restore(int $id): bool
    {
        $model = AssetModel::withTrashed()->findOrFail($id);
        return $model->restore();
    }

    /**
     * Force delete asset model permanently
     *
     * @param int $id
     * @return bool
     * @throws \Exception
     */
    public function forceDelete(int $id): bool
    {
        $model = AssetModel::withTrashed()->findOrFail($id);
        
        // Check if model has associated assets
        if ($model->assets()->count() > 0) {
            throw new \Exception('Cannot permanently delete asset model with associated assets.');
        }
        
        return $model->forceDelete();
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
