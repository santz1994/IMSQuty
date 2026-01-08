<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Carbon\Carbon;

class AuditLogService
{
    /**
     * Get filtered and paginated audit logs
     *
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getAuditLogs(array $filters = []): LengthAwarePaginator
    {
        $query = AuditLog::with(['user:id,username,email'])
            ->select('audit_logs.*');

        // Apply filters
        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (!empty($filters['resource'])) {
            $query->where('resource', 'like', '%' . $filters['resource'] . '%');
        }

        if (!empty($filters['ip_address'])) {
            $query->where('ip_address', 'like', '%' . $filters['ip_address'] . '%');
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        // Search across multiple fields
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('action', 'like', '%' . $search . '%')
                  ->orWhere('resource', 'like', '%' . $search . '%')
                  ->orWhere('ip_address', 'like', '%' . $search . '%')
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('username', 'like', '%' . $search . '%')
                               ->orWhere('email', 'like', '%' . $search . '%');
                  });
            });
        }

        // Order by created_at descending (most recent first)
        $query->orderBy('created_at', 'desc');

        // Pagination
        $perPage = $filters['per_page'] ?? 20;
        return $query->paginate($perPage);
    }

    /**
     * Get audit log statistics
     *
     * @param array $filters
     * @return array
     */
    public function getAuditStatistics(array $filters = []): array
    {
        $query = AuditLog::query();

        // Apply date filters
        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        // Total logs count
        $totalLogs = $query->count();

        // Actions breakdown
        $actionBreakdown = DB::table('audit_logs')
            ->select('action', DB::raw('count(*) as count'))
            ->when(!empty($filters['date_from']), function($q) use ($filters) {
                $q->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
            })
            ->when(!empty($filters['date_to']), function($q) use ($filters) {
                $q->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
            })
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->get();

        // Top users
        $topUsers = DB::table('audit_logs')
            ->join('users', 'audit_logs.user_id', '=', 'users.id')
            ->select('users.username', 'users.email', DB::raw('count(*) as count'))
            ->when(!empty($filters['date_from']), function($q) use ($filters) {
                $q->where('audit_logs.created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
            })
            ->when(!empty($filters['date_to']), function($q) use ($filters) {
                $q->where('audit_logs.created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
            })
            ->groupBy('users.id', 'users.username', 'users.email')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        // Activity timeline (last 7 days)
        $timeline = DB::table('audit_logs')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'asc')
            ->get();

        return [
            'total_logs' => $totalLogs,
            'action_breakdown' => $actionBreakdown,
            'top_users' => $topUsers,
            'activity_timeline' => $timeline,
        ];
    }

    /**
     * Get a single audit log by ID
     *
     * @param int $id
     * @return AuditLog|null
     */
    public function getAuditLogById(int $id): ?AuditLog
    {
        return AuditLog::with(['user:id,username,email,department_id', 'user.department:id,name'])
            ->find($id);
    }

    /**
     * Export audit logs to CSV
     *
     * @param array $filters
     * @return string Path to CSV file
     */
    public function exportToCSV(array $filters = []): string
    {
        $query = AuditLog::with(['user:id,username,email']);

        // Apply same filters as getAuditLogs
        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (!empty($filters['resource'])) {
            $query->where('resource', 'like', '%' . $filters['resource'] . '%');
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $query->orderBy('created_at', 'desc');
        $logs = $query->get();

        // Create CSV file
        $filename = 'audit_logs_' . Carbon::now()->format('Y-m-d_His') . '.csv';
        $filePath = storage_path('app/exports/' . $filename);

        // Ensure directory exists
        if (!file_exists(storage_path('app/exports'))) {
            mkdir(storage_path('app/exports'), 0755, true);
        }

        $file = fopen($filePath, 'w');

        // CSV Headers
        fputcsv($file, [
            'ID',
            'User',
            'Email',
            'Action',
            'Resource',
            'Resource ID',
            'IP Address',
            'User Agent',
            'Changes',
            'Timestamp',
        ]);

        // CSV Data
        foreach ($logs as $log) {
            fputcsv($file, [
                $log->id,
                $log->user->username ?? 'N/A',
                $log->user->email ?? 'N/A',
                $log->action,
                $log->resource,
                $log->resource_id,
                $log->ip_address,
                $log->user_agent,
                json_encode($log->changes),
                $log->created_at->format('Y-m-d H:i:s'),
            ]);
        }

        fclose($file);

        return $filePath;
    }

    /**
     * Clean up old audit logs (older than specified days)
     *
     * @param int $daysToKeep
     * @return int Number of deleted records
     */
    public function cleanupOldLogs(int $daysToKeep = 90): int
    {
        $cutoffDate = Carbon::now()->subDays($daysToKeep);
        return AuditLog::where('created_at', '<', $cutoffDate)->delete();
    }

    /**
     * Get available actions for filtering
     *
     * @return array
     */
    public function getAvailableActions(): array
    {
        return AuditLog::distinct()->pluck('action')->toArray();
    }

    /**
     * Get user activity summary
     *
     * @param int $userId
     * @param array $filters
     * @return array
     */
    public function getUserActivitySummary(int $userId, array $filters = []): array
    {
        $query = AuditLog::where('user_id', $userId);

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', Carbon::parse($filters['date_from'])->startOfDay());
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', Carbon::parse($filters['date_to'])->endOfDay());
        }

        $totalActions = $query->count();
        
        $actionBreakdown = (clone $query)
            ->select('action', DB::raw('count(*) as count'))
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->get();

        $recentActivity = (clone $query)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return [
            'user_id' => $userId,
            'total_actions' => $totalActions,
            'action_breakdown' => $actionBreakdown,
            'recent_activity' => $recentActivity,
        ];
    }
}
