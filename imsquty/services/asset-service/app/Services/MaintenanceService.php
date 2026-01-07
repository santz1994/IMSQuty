<?php

namespace App\Services;

use App\Models\AssetMaintenanceLog;
use App\Repositories\MaintenanceRepository;
use App\DTOs\MaintenanceDTO;
use Illuminate\Database\Eloquent\Collection;
use Carbon\Carbon;

class MaintenanceService
{
    protected MaintenanceRepository $maintenanceRepository;

    public function __construct(MaintenanceRepository $maintenanceRepository)
    {
        $this->maintenanceRepository = $maintenanceRepository;
    }

    /**
     * Create a new maintenance record
     */
    public function create(MaintenanceDTO $dto): AssetMaintenanceLog
    {
        $data = [
            'asset_id' => $dto->asset_id,
            'maintenance_type' => $dto->maintenance_type,
            'title' => $dto->title,
            'description' => $dto->description,
            'cost' => $dto->cost,
            'scheduled_at' => $dto->scheduled_at ?? Carbon::now(),
            'performed_by' => $dto->performed_by ?? auth()->id(),
            'status' => $dto->status ?? 'scheduled',
            'notes' => $dto->notes,
        ];

        return $this->maintenanceRepository->create($data);
    }

    /**
     * Update maintenance record
     */
    public function update(int $id, array $data): ?AssetMaintenanceLog
    {
        return $this->maintenanceRepository->update($id, $data);
    }

    /**
     * Get maintenance by ID
     */
    public function getById(int $id): ?AssetMaintenanceLog
    {
        return $this->maintenanceRepository->findById($id);
    }

    /**
     * Get maintenance history for an asset
     */
    public function getByAssetId(int $assetId): Collection
    {
        return $this->maintenanceRepository->getByAssetId($assetId);
    }

    /**
     * Get upcoming maintenance
     */
    public function getUpcoming(int $limit = 10): Collection
    {
        return $this->maintenanceRepository->getUpcoming($limit);
    }

    /**
     * Get overdue maintenance
     */
    public function getOverdue(): Collection
    {
        return $this->maintenanceRepository->getOverdue();
    }

    /**
     * Get maintenance by status
     */
    public function getByStatus(string $status): Collection
    {
        return $this->maintenanceRepository->getByStatus($status);
    }

    /**
     * Get maintenance by type
     */
    public function getByType(string $type): Collection
    {
        return $this->maintenanceRepository->getByType($type);
    }

    /**
     * Complete a maintenance record
     */
    public function complete(int $id, array $data): ?AssetMaintenanceLog
    {
        return $this->maintenanceRepository->complete($id, $data);
    }

    /**
     * Cancel a maintenance record
     */
    public function cancel(int $id, string $reason): ?AssetMaintenanceLog
    {
        return $this->maintenanceRepository->cancel($id, $reason);
    }

    /**
     * Get maintenance statistics
     */
    public function getStatistics(): array
    {
        return $this->maintenanceRepository->getStatistics();
    }

    /**
     * Delete maintenance record
     */
    public function delete(int $id): bool
    {
        return $this->maintenanceRepository->delete($id);
    }
}
