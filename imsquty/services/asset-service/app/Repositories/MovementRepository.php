<?php

namespace App\Repositories;

use App\Models\Movement;
use Shared\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;
use Carbon\Carbon;

class MovementRepository extends BaseRepository
{
    /**
     * Specify Model class name
     *
     * @return string
     */
    protected function model(): string
    {
        return Movement::class;
    }

    /**
     * Get movement history for an asset
     */
    public function getByAssetId(int $assetId): Collection
    {
        return Movement::where('asset_id', $assetId)
            ->with(['fromLocation', 'toLocation', 'movedByUser', 'asset'])
            ->orderBy('movement_date', 'desc')
            ->get();
    }

    /**
     * Get movements by location
     */
    public function getByLocation(int $locationId, string $type = 'both'): Collection
    {
        $query = Movement::with(['asset', 'fromLocation', 'toLocation', 'movedByUser']);

        if ($type === 'from') {
            $query->where('from_location_id', $locationId);
        } elseif ($type === 'to') {
            $query->where('to_location_id', $locationId);
        } else {
            $query->where(function($q) use ($locationId) {
                $q->where('from_location_id', $locationId)
                  ->orWhere('to_location_id', $locationId);
            });
        }

        return $query->orderBy('movement_date', 'desc')->get();
    }

    /**
     * Get movements by date range
     */
    public function getByDateRange(Carbon $startDate, Carbon $endDate): Collection
    {
        return Movement::whereBetween('movement_date', [$startDate, $endDate])
            ->with(['asset', 'fromLocation', 'toLocation', 'movedByUser'])
            ->orderBy('movement_date', 'desc')
            ->get();
    }

    /**
     * Get recent movements
     */
    public function getRecent(int $limit = 10): Collection
    {
        return Movement::with(['asset', 'fromLocation', 'toLocation', 'movedByUser'])
            ->orderBy('movement_date', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get movement statistics
     */
    public function getStatistics(): array
    {
        $total = Movement::count();
        $today = Movement::whereDate('movement_date', Carbon::today())->count();
        $thisWeek = Movement::whereBetween('movement_date', [
            Carbon::now()->startOfWeek(),
            Carbon::now()->endOfWeek()
        ])->count();
        $thisMonth = Movement::whereMonth('movement_date', Carbon::now()->month)->count();

        return [
            'total' => $total,
            'today' => $today,
            'this_week' => $thisWeek,
            'this_month' => $thisMonth,
        ];
    }

    /**
     * Get current location of an asset
     */
    public function getCurrentLocation(int $assetId): ?int
    {
        $lastMovement = Movement::where('asset_id', $assetId)
            ->orderBy('movement_date', 'desc')
            ->first();

        return $lastMovement ? $lastMovement->to_location_id : null;
    }
}
