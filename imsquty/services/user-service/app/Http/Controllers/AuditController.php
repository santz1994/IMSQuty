<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Shared\Traits\ApiResponses;

class AuditController extends Controller
{
    use ApiResponses;

    /**
     * Get paginated audit logs with filtering
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('per_page', 25);
            $page = $request->input('page', 1);
            $userId = $request->input('user_id');
            $action = $request->input('action');
            $module = $request->input('module');
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            // Mock data for now - in production, query actual audit_logs table
            $logs = $this->getMockAuditLogs($userId, $action, $module, $startDate, $endDate);
            
            // Paginate manually
            $total = count($logs);
            $offset = ($page - 1) * $perPage;
            $paginatedLogs = array_slice($logs, $offset, $perPage);

            return $this->successResponse([
                'data' => $paginatedLogs,
                'pagination' => [
                    'current_page' => (int)$page,
                    'per_page' => (int)$perPage,
                    'total' => $total,
                    'last_page' => ceil($total / $perPage),
                ]
            ], 'Audit logs retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve audit logs: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get audit statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            // Mock statistics - in production, calculate from audit_logs table
            $stats = [
                'total_logs' => 1234,
                'today_logs' => 45,
                'week_logs' => 312,
                'month_logs' => 987,
                'top_actions' => [
                    ['action' => 'login', 'count' => 456],
                    ['action' => 'create', 'count' => 234],
                    ['action' => 'update', 'count' => 189],
                    ['action' => 'delete', 'count' => 78],
                    ['action' => 'view', 'count' => 277],
                ],
                'top_users' => [
                    ['user_id' => 1, 'username' => 'superadmin', 'count' => 234],
                    ['user_id' => 2, 'username' => 'director', 'count' => 189],
                    ['user_id' => 3, 'username' => 'manager', 'count' => 156],
                ],
                'top_modules' => [
                    ['module' => 'users', 'count' => 345],
                    ['module' => 'assets', 'count' => 289],
                    ['module' => 'tickets', 'count' => 234],
                    ['module' => 'inventory', 'count' => 178],
                ],
            ];

            return $this->successResponse($stats, 'Audit statistics retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve audit statistics: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get available audit actions
     */
    public function actions(): JsonResponse
    {
        try {
            $actions = [
                'login',
                'logout',
                'create',
                'update',
                'delete',
                'view',
                'export',
                'import',
                'assign',
                'approve',
                'reject',
                'restore',
                'archive',
            ];

            return $this->successResponse($actions, 'Available actions retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve actions: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get available audit modules
     */
    public function modules(): JsonResponse
    {
        try {
            $modules = [
                'auth',
                'users',
                'roles',
                'permissions',
                'assets',
                'tickets',
                'inventory',
                'financials',
                'meeting-rooms',
                'master-data',
                'settings',
                'reports',
            ];

            return $this->successResponse($modules, 'Available modules retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve modules: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get audit log by ID
     */
    public function show(string $id): JsonResponse
    {
        try {
            // Mock single log - in production, query from audit_logs table
            $log = [
                'id' => $id,
                'user_id' => 1,
                'username' => 'superadmin',
                'action' => 'update',
                'module' => 'users',
                'description' => 'Updated user profile',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'old_values' => ['email' => 'old@example.com'],
                'new_values' => ['email' => 'new@example.com'],
                'created_at' => now()->subHours(2)->toIso8601String(),
            ];

            return $this->successResponse($log, 'Audit log retrieved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve audit log: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Export audit logs
     */
    public function export(Request $request): JsonResponse
    {
        try {
            // Mock export - in production, generate actual CSV/Excel file
            return $this->successResponse([
                'download_url' => '/downloads/audit-logs-' . now()->format('Y-m-d') . '.csv',
                'expires_at' => now()->addHours(1)->toIso8601String(),
            ], 'Audit logs export prepared successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to export audit logs: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generate mock audit logs for testing
     */
    private function getMockAuditLogs($userId = null, $action = null, $module = null, $startDate = null, $endDate = null): array
    {
        $users = [
            ['id' => 1, 'username' => 'superadmin'],
            ['id' => 2, 'username' => 'director'],
            ['id' => 3, 'username' => 'manager'],
            ['id' => 4, 'username' => 'admin'],
            ['id' => 5, 'username' => 'user'],
        ];

        $actions = ['login', 'logout', 'create', 'update', 'delete', 'view', 'export'];
        $modules = ['users', 'assets', 'tickets', 'inventory', 'settings'];
        $descriptions = [
            'login' => 'User logged in',
            'logout' => 'User logged out',
            'create' => 'Created new record',
            'update' => 'Updated existing record',
            'delete' => 'Deleted record',
            'view' => 'Viewed details',
            'export' => 'Exported data',
        ];

        $logs = [];
        for ($i = 1; $i <= 100; $i++) {
            $user = $users[array_rand($users)];
            $selectedAction = $actions[array_rand($actions)];
            $selectedModule = $modules[array_rand($modules)];
            
            $logs[] = [
                'id' => $i,
                'user_id' => $user['id'],
                'username' => $user['username'],
                'action' => $selectedAction,
                'module' => $selectedModule,
                'description' => $descriptions[$selectedAction] . ' in ' . $selectedModule,
                'ip_address' => '192.168.1.' . rand(1, 254),
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'created_at' => now()->subDays(rand(0, 30))->toIso8601String(),
            ];
        }

        // Apply filters
        if ($userId) {
            $logs = array_filter($logs, fn($log) => $log['user_id'] == $userId);
        }
        if ($action) {
            $logs = array_filter($logs, fn($log) => $log['action'] == $action);
        }
        if ($module) {
            $logs = array_filter($logs, fn($log) => $log['module'] == $module);
        }

        return array_values($logs);
    }
}
