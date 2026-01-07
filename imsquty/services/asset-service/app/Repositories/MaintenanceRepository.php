<?php

namespace App\Repositories;

use App\Models\AssetMaintenanceLog;
use Shared\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;
use Carbon\Carbon;

class MaintenanceRepository extends BaseRepository
{
    /**
     * Specify Model class name
     *
     * @return string
     */
    protected function model(): string
    {
        return AssetMaintenanceLog::class;
    }

    /**
     * Get maintenance history for an asset
     */
    public function getByAssetId(int $assetId): Collection
    {
        return AssetMaintenanceLog::where('asset_id', $assetId)
            ->with(['asset', 'performedByUser'])
            ->orderBy('scheduled_at', 'desc')
            ->get();
    }

    /**
     * Get upcoming maintenance (scheduled but not completed)
     */
    public function getUpcoming(int $limit = 10): Collection
    {
        return AssetMaintenanceLog::where('status', 'scheduled')
            ->whereDate('scheduled_at', '>=', Carbon::now())
            ->with(['asset', 'performedByUser'])
            ->orderBy('scheduled_at', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get overdue maintenance
     */
    public function getOverdue(): Collection
    {
        return AssetMaintenanceLog::where('status', 'scheduled')
            ->whereDate('scheduled_at', '<', Carbon::now())
            ->with(['asset', 'performedByUser'])
            ->orderBy('scheduled_at', 'asc')
            ->get();
    }

    /**
     * Get maintenance by status
     */
    public function getByStatus(string $status): Collection
    {
        return AssetMaintenanceLog::where('status', $status)
            ->with(['asset', 'performedByUser'])
            ->orderBy('scheduled_at', 'desc')
            ->get();
    }

    /**
     * Get maintenance by type
     */
    public function getByType(string $type): Collection
    {
        return AssetMaintenanceLog::where('maintenance_type', $type)
            ->with(['asset', 'performedByUser'])
            ->orderBy('scheduled_at', 'desc')
            ->get();
    }

    /**
     * Get maintenance statistics
     */
    public function getStatistics(): array
    {
        $total = AssetMaintenanceLog::count();
        $scheduled = AssetMaintenanceLog::where('status', 'scheduled')->count();
        $inProgress = AssetMaintenanceLog::where('status', 'in_progress')->count();
        $completed = AssetMaintenanceLog::where('status', 'completed')->count();
        $overdue = AssetMaintenanceLog::where('status', 'scheduled')
            ->whereDate('scheduled_at', '<', Carbon::now())
            ->count();
        
        $totalCost = AssetMaintenanceLog::where('status', 'completed')
            ->sum('cost');

        return [
            'total' => $total,
            'scheduled' => $scheduled,
            'in_progress' => $inProgress,
            'completed' => $completed,
            'overdue' => $overdue,
            'total_cost' => (float) $totalCost,
        ];
    }

    /**
     * Complete a maintenance record
     */
    public function complete(int $id, array $data): ?AssetMaintenanceLog
    {
        $maintenance = $this->findById($id);
        if (!$maintenance) {
            return null;
        }

        $maintenance->update([
            'status' => 'completed',
            'completed_at' => $data['completed_at'] ?? Carbon::now(),
            'cost' => $data['cost'] ?? $maintenance->cost,
            'notes' => $data['notes'] ?? $maintenance->notes,
            'performed_by' => $data['performed_by'] ?? auth()->id(),
        ]);

        return $maintenance->fresh();
    }

    /**
     * Cancel a maintenance record
     */
    public function cancel(int $id, string $reason): ?AssetMaintenanceLog
    {
        $maintenance = $this->findById($id);
        if (!$maintenance) {
            return null;
        }

        $maintenance->update([
            'status' => 'cancelled',
            'notes' => ($maintenance->notes ? $maintenance->notes . "\n\n" : '') . "Cancelled: {$reason}",
        ]);

        return $maintenance->fresh();
    }
}
