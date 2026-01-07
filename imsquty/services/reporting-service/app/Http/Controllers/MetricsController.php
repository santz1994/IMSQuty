<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Metrics Controller - Reporting Service
 * 
 * Exposes Prometheus-compatible metrics for reporting monitoring
 */
class MetricsController extends Controller
{
    public function index()
    {
        $metrics = [];
        
        // Reports generated today
        $generatedToday = DB::table('reports')
            ->whereDate('created_at', today())
            ->count();
        $metrics[] = "# HELP report_generated_today Reports generated today";
        $metrics[] = "# TYPE report_generated_today counter";
        $metrics[] = "report_generated_today $generatedToday";
        
        // By type
        $byType = DB::table('reports')
            ->select('report_type', DB::raw('count(*) as count'))
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('report_type')
            ->get();
        
        $metrics[] = "# HELP report_by_type Reports by type (30d)";
        $metrics[] = "# TYPE report_by_type gauge";
        foreach ($byType as $type) {
            $reportType = str_replace(' ', '_', strtolower($type->report_type));
            $metrics[] = "report_by_type{type=\"$reportType\"} {$type->count}";
        }
        
        // Generation time average
        $avgTime = DB::table('reports')
            ->where('created_at', '>=', now()->subDays(7))
            ->whereNotNull('generation_time')
            ->avg('generation_time') ?? 0;
        $metrics[] = "# HELP report_generation_time_avg Average generation time (seconds, 7d)";
        $metrics[] = "# TYPE report_generation_time_avg gauge";
        $metrics[] = "report_generation_time_avg " . round($avgTime, 2);
        
        // Scheduled reports
        $scheduled = DB::table('report_schedules')
            ->where('is_active', true)
            ->count();
        $metrics[] = "# HELP report_scheduled Active scheduled reports";
        $metrics[] = "# TYPE report_scheduled gauge";
        $metrics[] = "report_scheduled $scheduled";
        
        // Failed reports
        $failed = DB::table('reports')
            ->where('status', 'failed')
            ->where('created_at', '>=', now()->subDay())
            ->count();
        $metrics[] = "# HELP report_failed Failed report generations (24h)";
        $metrics[] = "# TYPE report_failed counter";
        $metrics[] = "report_failed $failed";
        
        // Export count by format
        $byFormat = DB::table('report_exports')
            ->select('format', DB::raw('count(*) as count'))
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('format')
            ->get();
        
        $metrics[] = "# HELP report_export_count Report exports by format (7d)";
        $metrics[] = "# TYPE report_export_count gauge";
        foreach ($byFormat as $format) {
            $formatName = strtolower($format->format);
            $metrics[] = "report_export_count{format=\"$formatName\"} {$format->count}";
        }
        
        $this->addSystemMetrics($metrics, 'reporting_service');
        
        return response(implode("\n", $metrics) . "\n")
            ->header('Content-Type', 'text/plain; version=0.0.4');
    }
    
    public function health()
    {
        try {
            DB::connection()->getPdo();
            return response()->json([
                'status' => 'healthy',
                'service' => 'reporting-service',
                'timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'service' => 'reporting-service',
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
