<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Metrics Controller - User Service
 * 
 * Exposes Prometheus-compatible metrics for user management monitoring
 */
class MetricsController extends Controller
{
    public function index()
    {
        $metrics = [];
        
        // Total users
        $totalUsers = DB::table('users')->count();
        $metrics[] = "# HELP user_total Total users";
        $metrics[] = "# TYPE user_total gauge";
        $metrics[] = "user_total $totalUsers";
        
        // Active users (30d)
        $activeUsers = DB::table('user_activity_logs')
            ->where('created_at', '>=', now()->subDays(30))
            ->distinct('user_id')
            ->count('user_id');
        $metrics[] = "# HELP user_active_30d Active users in last 30 days";
        $metrics[] = "# TYPE user_active_30d gauge";
        $metrics[] = "user_active_30d $activeUsers";
        
        // By department
        $byDepartment = DB::table('users')
            ->join('departments', 'users.department_id', '=', 'departments.id')
            ->select('departments.name', DB::raw('count(*) as count'))
            ->groupBy('departments.name')
            ->get();
        
        $metrics[] = "# HELP user_by_department Users by department";
        $metrics[] = "# TYPE user_by_department gauge";
        foreach ($byDepartment as $dept) {
            $department = str_replace(' ', '_', strtolower($dept->name));
            $metrics[] = "user_by_department{department=\"$department\"} {$dept->count}";
        }
        
        // By position
        $byPosition = DB::table('user_profiles')
            ->select('position', DB::raw('count(*) as count'))
            ->whereNotNull('position')
            ->groupBy('position')
            ->get();
        
        $metrics[] = "# HELP user_by_position Users by position";
        $metrics[] = "# TYPE user_by_position gauge";
        foreach ($byPosition as $pos) {
            $position = str_replace(' ', '_', strtolower($pos->position));
            $metrics[] = "user_by_position{position=\"$position\"} {$pos->count}";
        }
        
        // New users this month
        $newUsersMonth = DB::table('users')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $metrics[] = "# HELP user_new_this_month New users this month";
        $metrics[] = "# TYPE user_new_this_month counter";
        $metrics[] = "user_new_this_month $newUsersMonth";
        
        // User retention rate
        $usersLastMonth = DB::table('user_activity_logs')
            ->where('created_at', '>=', now()->subDays(60))
            ->where('created_at', '<', now()->subDays(30))
            ->distinct('user_id')
            ->count('user_id');
        $retentionRate = $usersLastMonth > 0 ? round($activeUsers / $usersLastMonth, 4) : 1.0;
        $metrics[] = "# HELP user_retention_rate User retention rate";
        $metrics[] = "# TYPE user_retention_rate gauge";
        $metrics[] = "user_retention_rate $retentionRate";
        
        $this->addSystemMetrics($metrics, 'user_service');
        
        return response(implode("\n", $metrics) . "\n")
            ->header('Content-Type', 'text/plain; version=0.0.4');
    }
    
    public function health()
    {
        try {
            DB::connection()->getPdo();
            return response()->json([
                'status' => 'healthy',
                'service' => 'user-service',
                'timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'service' => 'user-service',
                'error' => $e->getMessage()
            ], 503);
        }
    }
    
    private function addSystemMetrics(array &$metrics, string $serviceName)
    {
        try {
            $dbConnections = DB::select("SHOW STATUS WHERE Variable_name = 'Threads_connected'");
            if (!empty($dbConnections)) {
                $connections = $dbConnections[0]->Value;
                $metrics[] = "# HELP {$serviceName}_db_connections Active database connections";
                $metrics[] = "# TYPE {$serviceName}_db_connections gauge";
                $metrics[] = "{$serviceName}_db_connections $connections";
            }
        } catch (\Exception $e) {}
        
        $uptime = Cache::remember("{$serviceName}_start_time", 3600, fn() => now());
        $uptimeSeconds = now()->diffInSeconds($uptime);
        $metrics[] = "# HELP {$serviceName}_uptime_seconds Service uptime in seconds";
        $metrics[] = "# TYPE {$serviceName}_uptime_seconds counter";
        $metrics[] = "{$serviceName}_uptime_seconds $uptimeSeconds";
        
        $metrics[] = "# HELP {$serviceName}_health_status Service health (1=healthy, 0=unhealthy)";
        $metrics[] = "# TYPE {$serviceName}_health_status gauge";
        $metrics[] = "{$serviceName}_health_status 1";
    }
}
