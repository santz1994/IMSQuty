<?php

namespace App\Services;

use App\Models\AssetModel;
use App\Repositories\AssetModelRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * AssetModel Service
 * 
 * Business logic layer for AssetModel management.
 * Handles transactions, validations, and complex operations.
 */
class AssetModelService
{
    /**
     * @var AssetModelRepository
     */
    protected $assetModelRepository;

    /**
     * Constructor
     *
     * @param AssetModelRepository $assetModelRepository
     */
    public function __construct(AssetModelRepository $assetModelRepository)
    {
        $this->assetModelRepository = $assetModelRepository;
    }

    /**
     * Get all asset models with filters
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllAssetModels(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        try {
            return $this->assetModelRepository->getAll($filters, $perPage);
        } catch (\Exception $e) {
            Log::error('Error fetching asset models: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get all asset models (no pagination)
     *
     * @return Collection
     */
    public function getAllModels(): Collection
    {
        try {
            return $this->assetModelRepository->getAllModels();
        } catch (\Exception $e) {
            Log::error('Error fetching all models: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get asset model by ID
     *
     * @param int $id
     * @param bool $withTrashed
     * @return AssetModel|null
     */
    public function getAssetModelById(int $id, bool $withTrashed = false): ?AssetModel
    {
        try {
            $model = $this->assetModelRepository->findById($id, $withTrashed);
            
            if (!$model) {
                throw new \Exception("Asset model not found");
            }
            
            return $model;
        } catch (\Exception $e) {
            Log::error('Error fetching asset model: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get asset models by type
     *
     * @param int $assetTypeId
     * @return Collection
     */
    public function getAssetModelsByType(int $assetTypeId): Collection
    {
        try {
            return $this->assetModelRepository->getByType($assetTypeId);
        } catch (\Exception $e) {
            Log::error('Error fetching asset models by type: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get asset models by manufacturer
     *
     * @param int $manufacturerId
     * @return Collection
     */
    public function getAssetModelsByManufacturer(int $manufacturerId): Collection
    {
        try {
            return $this->assetModelRepository->getByManufacturer($manufacturerId);
        } catch (\Exception $e) {
            Log::error('Error fetching asset models by manufacturer: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create new asset model
     *
     * @param array $data
     * @return AssetModel
     */
    public function createAssetModel(array $data): AssetModel
    {
        DB::beginTransaction();
        
        try {
            // Validate model name uniqueness
            if (isset($data['asset_model']) && $this->assetModelRepository->modelNameExists($data['asset_model'])) {
                throw new \Exception("Asset model name '{$data['asset_model']}' already exists.");
            }

            // Create asset model
            $model = $this->assetModelRepository->create($data);

            // Log creation
            Log::info('Asset model created', [
                'model_id' => $model->id,
                'model_name' => $model->asset_model,
            ]);

            DB::commit();
            return $model;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating asset model: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update asset model
     *
     * @param int $id
     * @param array $data
     * @return AssetModel
     */
    public function updateAssetModel(int $id, array $data): AssetModel
    {
        DB::beginTransaction();
        
        try {
            // Check if model exists
            $model = $this->getAssetModelById($id);

            // Validate model name uniqueness (excluding current model)
            if (isset($data['asset_model']) && $this->assetModelRepository->modelNameExists($data['asset_model'], $id)) {
                throw new \Exception("Asset model name '{$data['asset_model']}' already exists.");
            }

            // Update asset model
            $this->assetModelRepository->update($id, $data);
            
            // Fetch updated model
            $model = $this->getAssetModelById($id);

            // Log update
            Log::info('Asset model updated', [
                'model_id' => $model->id,
                'model_name' => $model->asset_model,
            ]);

            DB::commit();
            return $model;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating asset model: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete asset model (soft delete)
     *
     * @param int $id
     * @return bool
     */
    public function deleteAssetModel(int $id): bool
    {
        DB::beginTransaction();
        
        try {
            // Check if model exists
            $model = $this->getAssetModelById($id);

            // Delete model (repository will check for associated assets)
            $result = $this->assetModelRepository->delete($id);

            // Log deletion
            Log::info('Asset model deleted', [
                'model_id' => $model->id,
                'model_name' => $model->asset_model,
            ]);

            DB::commit();
            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting asset model: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Restore deleted asset model
     *
     * @param int $id
     * @return bool
     */
    public function restoreAssetModel(int $id): bool
    {
        DB::beginTransaction();
        
        try {
            // Restore model
            $result = $this->assetModelRepository->restore($id);

            // Log restoration
            Log::info('Asset model restored', ['model_id' => $id]);

            DB::commit();
            return $result;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error restoring asset model: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get asset models with asset counts
     *
     * @return Collection
     */
    public function getModelsWithAssetCounts(): Collection
    {
        try {
            return $this->assetModelRepository->getWithAssetCounts();
        } catch (\Exception $e) {
            Log::error('Error fetching models with asset counts: ' . $e->getMessage());
            throw $e;
        }
    }
}
