<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Metrics Controller - Master Data Service
 * 
 * Exposes Prometheus-compatible metrics for master data monitoring
 */
class MetricsController extends Controller
{
    public function index()
    {
        $metrics = [];
        
        // Total categories
        $totalCategories = DB::table('categories')->count();
        $metrics[] = "# HELP masterdata_categories_total Total categories";
        $metrics[] = "# TYPE masterdata_categories_total gauge";
        $metrics[] = "masterdata_categories_total $totalCategories";
        
        // Total locations
        $totalLocations = DB::table('locations')->count();
        $metrics[] = "# HELP masterdata_locations_total Total locations";
        $metrics[] = "# TYPE masterdata_locations_total gauge";
        $metrics[] = "masterdata_locations_total $totalLocations";
        
        // Total departments
        $totalDepartments = DB::table('departments')->count();
        $metrics[] = "# HELP masterdata_departments_total Total departments";
        $metrics[] = "# TYPE masterdata_departments_total gauge";
        $metrics[] = "masterdata_departments_total $totalDepartments";
        
        // Total vendors
        $totalVendors = DB::table('vendors')->count();
        $metrics[] = "# HELP masterdata_vendors_total Total vendors";
        $metrics[] = "# TYPE masterdata_vendors_total gauge";
        $metrics[] = "masterdata_vendors_total $totalVendors";
        
        // Total manufacturers
        $totalManufacturers = DB::table('manufacturers')->count();
        $metrics[] = "# HELP masterdata_manufacturers_total Total manufacturers";
        $metrics[] = "# TYPE masterdata_manufacturers_total gauge";
        $metrics[] = "masterdata_manufacturers_total $totalManufacturers";
        
        // Total configurations
        $totalConfigs = DB::table('configurations')->count();
        $metrics[] = "# HELP masterdata_configurations_total Total system configurations";
        $metrics[] = "# TYPE masterdata_configurations_total gauge";
        $metrics[] = "masterdata_configurations_total $totalConfigs";
        
        // Cache hit rate
        $cacheHits = Cache::get('masterdata_cache_hits', 0);
        $cacheMisses = Cache::get('masterdata_cache_misses', 0);
        $totalOps = $cacheHits + $cacheMisses;
        $cacheHitRate = $totalOps > 0 ? round($cacheHits / $totalOps, 4) : 0;
        $metrics[] = "# HELP masterdata_cache_hit_rate Cache hit rate";
        $metrics[] = "# TYPE masterdata_cache_hit_rate gauge";
        $metrics[] = "masterdata_cache_hit_rate $cacheHitRate";
        
        $this->addSystemMetrics($metrics, 'master_data_service');
        
        return response(implode("\n", $metrics) . "\n")
            ->header('Content-Type', 'text/plain; version=0.0.4');
    }
    
    public function health()
    {
        try {
            DB::connection()->getPdo();
            return response()->json([
                'status' => 'healthy',
                'service' => 'master-data-service',
                'timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'service' => 'master-data-service',
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
