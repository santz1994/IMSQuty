<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Metrics Controller - Asset Service
 * 
 * Exposes Prometheus-compatible metrics for asset management monitoring
 */
class MetricsController extends Controller
{
    /**
     * Get metrics in Prometheus format
     */
    public function index()
    {
        $metrics = [];
        
        // ========================================
        // ASSET METRICS
        // ========================================
        
        // Total assets
        $totalAssets = DB::table('assets')->count();
        $metrics[] = "# HELP asset_total Total assets in system";
        $metrics[] = "# TYPE asset_total gauge";
        $metrics[] = "asset_total $totalAssets";
        
        // Assets by status
        $assetsByStatus = DB::table('assets')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();
        
        $metrics[] = "# HELP asset_by_status Assets grouped by status";
        $metrics[] = "# TYPE asset_by_status gauge";
        foreach ($assetsByStatus as $stat) {
            $status = strtolower($stat->status);
            $metrics[] = "asset_by_status{status=\"$status\"} {$stat->count}";
        }
        
        // Assets by category
        $assetsByCategory = DB::table('assets')
            ->join('categories', 'assets.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('count(*) as count'))
            ->groupBy('categories.name')
            ->get();
        
        $metrics[] = "# HELP asset_by_category Assets grouped by category";
        $metrics[] = "# TYPE asset_by_category gauge";
        foreach ($assetsByCategory as $cat) {
            $category = str_replace(' ', '_', strtolower($cat->name));
            $metrics[] = "asset_by_category{category=\"$category\"} {$cat->count}";
        }
        
        // Assets by location
        $assetsByLocation = DB::table('assets')
            ->join('locations', 'assets.location_id', '=', 'locations.id')
            ->select('locations.name', DB::raw('count(*) as count'))
            ->groupBy('locations.name')
            ->get();
        
        $metrics[] = "# HELP asset_by_location Assets grouped by location";
        $metrics[] = "# TYPE asset_by_location gauge";
        foreach ($assetsByLocation as $loc) {
            $location = str_replace(' ', '_', strtolower($loc->name));
            $metrics[] = "asset_by_location{location=\"$location\"} {$loc->count}";
        }
        
        // Total asset value
        $totalValue = DB::table('assets')->sum('purchase_price') ?? 0;
        $metrics[] = "# HELP asset_total_value Total purchase value of all assets";
        $metrics[] = "# TYPE asset_total_value gauge";
        $metrics[] = "asset_total_value $totalValue";
        
        // Total depreciation
        $totalDepreciation = DB::table('assets')->sum('accumulated_depreciation') ?? 0;
        $metrics[] = "# HELP asset_depreciation_total Total accumulated depreciation";
        $metrics[] = "# TYPE asset_depreciation_total gauge";
        $metrics[] = "asset_depreciation_total $totalDepreciation";
        
        // Assets with maintenance due
        $maintenanceDue = DB::table('assets')
            ->where('next_maintenance_date', '<=', now()->addDays(7))
            ->where('status', 'active')
            ->count();
        $metrics[] = "# HELP asset_maintenance_due Assets with maintenance due within 7 days";
        $metrics[] = "# TYPE asset_maintenance_due gauge";
        $metrics[] = "asset_maintenance_due $maintenanceDue";
        
        // Asset utilization rate
        $assignedAssets = DB::table('asset_assignments')
            ->where('status', 'active')
            ->distinct('asset_id')
            ->count('asset_id');
        $utilizationRate = $totalAssets > 0 ? round($assignedAssets / $totalAssets, 4) : 0;
        $metrics[] = "# HELP asset_utilization_rate Asset utilization percentage";
        $metrics[] = "# TYPE asset_utilization_rate gauge";
        $metrics[] = "asset_utilization_rate $utilizationRate";
        
        // ========================================
        // ASSIGNMENT METRICS
        // ========================================
        
        // Active assignments
        $activeAssignments = DB::table('asset_assignments')
            ->where('status', 'active')
            ->count();
        $metrics[] = "# HELP asset_assignments_active Active asset assignments";
        $metrics[] = "# TYPE asset_assignments_active gauge";
        $metrics[] = "asset_assignments_active $activeAssignments";
        
        // ========================================
        // MAINTENANCE METRICS
        // ========================================
        
        // Maintenance records (last 30 days)
        $maintenanceCount = DB::table('asset_maintenances')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();
        $metrics[] = "# HELP asset_maintenance_last_30d Maintenance records in last 30 days";
        $metrics[] = "# TYPE asset_maintenance_last_30d counter";
        $metrics[] = "asset_maintenance_last_30d $maintenanceCount";
        
        // Average maintenance cost
        $avgMaintenanceCost = DB::table('asset_maintenances')
            ->where('created_at', '>=', now()->subDays(30))
            ->avg('cost') ?? 0;
        $metrics[] = "# HELP asset_maintenance_avg_cost Average maintenance cost (30d)";
        $metrics[] = "# TYPE asset_maintenance_avg_cost gauge";
        $metrics[] = "asset_maintenance_avg_cost $avgMaintenanceCost";
        
        // ========================================
        // SYSTEM HEALTH
        // ========================================
        
        $this->addSystemMetrics($metrics, 'asset_service');
        
        return response(implode("\n", $metrics) . "\n")
            ->header('Content-Type', 'text/plain; version=0.0.4');
    }
    
    /**
     * Health check endpoint
     */
    public function health()
    {
        try {
            DB::connection()->getPdo();
            
            if (config('cache.default') === 'redis') {
                Cache::get('health_check');
            }
            
            return response()->json([
                'status' => 'healthy',
                'service' => 'asset-service',
                'timestamp' => now()->toIso8601String(),
                'checks' => [
                    'database' => 'ok',
                    'cache' => 'ok'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'service' => 'asset-service',
                'timestamp' => now()->toIso8601String(),
                'error' => $e->getMessage()
            ], 503);
        }
    }
    
    /**
     * Add common system metrics
     */
    private function addSystemMetrics(array &$metrics, string $serviceName)
    {
        // Database connections
        try {
            $dbConnections = DB::select("SHOW STATUS WHERE Variable_name = 'Threads_connected'");
            if (!empty($dbConnections)) {
                $connections = $dbConnections[0]->Value;
                $metrics[] = "# HELP {$serviceName}_db_connections Active database connections";
                $metrics[] = "# TYPE {$serviceName}_db_connections gauge";
                $metrics[] = "{$serviceName}_db_connections $connections";
            }
        } catch (\Exception $e) {
            // Skip if not available
        }
        
        // Service uptime
        $uptime = Cache::remember("{$serviceName}_start_time", 3600, function() {
            return now();
        });
        $uptimeSeconds = now()->diffInSeconds($uptime);
        $metrics[] = "# HELP {$serviceName}_uptime_seconds Service uptime in seconds";
        $metrics[] = "# TYPE {$serviceName}_uptime_seconds counter";
        $metrics[] = "{$serviceName}_uptime_seconds $uptimeSeconds";
        
        // Health status
        $metrics[] = "# HELP {$serviceName}_health_status Service health (1=healthy, 0=unhealthy)";
        $metrics[] = "# TYPE {$serviceName}_health_status gauge";
        $metrics[] = "{$serviceName}_health_status 1";
    }
}
