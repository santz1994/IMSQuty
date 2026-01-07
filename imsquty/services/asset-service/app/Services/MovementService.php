<?php

namespace App\Services;

use App\Models\Movement;
use App\Repositories\MovementRepository;
use App\DTOs\AssetMovementDTO;
use Illuminate\Database\Eloquent\Collection;
use Carbon\Carbon;

class MovementService
{
    protected MovementRepository $movementRepository;

    public function __construct(MovementRepository $movementRepository)
    {
        $this->movementRepository = $movementRepository;
    }

    /**
     * Create a new movement record
     */
    public function create(AssetMovementDTO $dto): Movement
    {
        $data = [
            'asset_id' => $dto->asset_id,
            'from_location_id' => $dto->from_location_id,
            'to_location_id' => $dto->to_location_id,
            'movement_date' => $dto->movement_date ?? Carbon::now(),
            'moved_by' => $dto->moved_by ?? auth()->id(),
            'reason' => $dto->reason,
            'notes' => $dto->notes,
        ];

        return $this->movementRepository->create($data);
    }

    /**
     * Get movement by ID
     */
    public function getById(int $id): ?Movement
    {
        return $this->movementRepository->findById($id);
    }

    /**
     * Get movement history for an asset
     */
    public function getByAssetId(int $assetId): Collection
    {
        return $this->movementRepository->getByAssetId($assetId);
    }

    /**
     * Get movements by location
     */
    public function getByLocation(int $locationId, string $type = 'both'): Collection
    {
        return $this->movementRepository->getByLocation($locationId, $type);
    }

    /**
     * Get movements by date range
     */
    public function getByDateRange(Carbon $startDate, Carbon $endDate): Collection
    {
        return $this->movementRepository->getByDateRange($startDate, $endDate);
    }

    /**
     * Get recent movements
     */
    public function getRecent(int $limit = 10): Collection
    {
        return $this->movementRepository->getRecent($limit);
    }

    /**
     * Get movement statistics
     */
    public function getStatistics(): array
    {
        return $this->movementRepository->getStatistics();
    }

    /**
     * Get current location of an asset
     */
    public function getCurrentLocation(int $assetId): ?int
    {
        return $this->movementRepository->getCurrentLocation($assetId);
    }

    /**
     * Delete movement record
     */
    public function delete(int $id): bool
    {
        return $this->movementRepository->delete($id);
    }
}
