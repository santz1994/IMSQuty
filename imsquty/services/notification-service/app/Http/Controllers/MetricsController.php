<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Metrics Controller - Notification Service
 * 
 * Exposes Prometheus-compatible metrics for notification monitoring
 */
class MetricsController extends Controller
{
    public function index()
    {
        $metrics = [];
        
        // Notifications sent today
        $sentToday = DB::table('notifications')
            ->whereDate('created_at', today())
            ->count();
        $metrics[] = "# HELP notification_sent_today Notifications sent today";
        $metrics[] = "# TYPE notification_sent_today counter";
        $metrics[] = "notification_sent_today $sentToday";
        
        // By channel
        $byChannel = DB::table('notifications')
            ->select('channel', DB::raw('count(*) as count'))
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('channel')
            ->get();
        
        $metrics[] = "# HELP notification_by_channel Notifications by channel (7d)";
        $metrics[] = "# TYPE notification_by_channel gauge";
        foreach ($byChannel as $ch) {
            $channel = strtolower($ch->channel);
            $metrics[] = "notification_by_channel{channel=\"$channel\"} {$ch->count}";
        }
        
        // By status
        $byStatus = DB::table('notifications')
            ->select('status', DB::raw('count(*) as count'))
            ->where('created_at', '>=', now()->subDay())
            ->groupBy('status')
            ->get();
        
        $metrics[] = "# HELP notification_by_status Notifications by status (24h)";
        $metrics[] = "# TYPE notification_by_status gauge";
        foreach ($byStatus as $st) {
            $status = strtolower($st->status);
            $metrics[] = "notification_by_status{status=\"$status\"} {$st->count}";
        }
        
        // Delivery rate
        $totalSent = DB::table('notification_logs')
            ->where('created_at', '>=', now()->subDay())
            ->count();
        $successful = DB::table('notification_logs')
            ->where('created_at', '>=', now()->subDay())
            ->where('status', 'delivered')
            ->count();
        $deliveryRate = $totalSent > 0 ? round($successful / $totalSent, 4) : 1.0;
        $metrics[] = "# HELP notification_delivery_rate Delivery success rate (24h)";
        $metrics[] = "# TYPE notification_delivery_rate gauge";
        $metrics[] = "notification_delivery_rate $deliveryRate";
        
        // Read rate
        $totalDelivered = $successful;
        $read = DB::table('notifications')
            ->where('created_at', '>=', now()->subDays(7))
            ->whereNotNull('read_at')
            ->count();
        $readRate = $totalDelivered > 0 ? round($read / $totalDelivered, 4) : 0;
        $metrics[] = "# HELP notification_read_rate Read rate (7d)";
        $metrics[] = "# TYPE notification_read_rate gauge";
        $metrics[] = "notification_read_rate $readRate";
        
        // Pending queue
        $pending = DB::table('notifications')
            ->where('status', 'pending')
            ->count();
        $metrics[] = "# HELP notification_pending Pending notifications in queue";
        $metrics[] = "# TYPE notification_pending gauge";
        $metrics[] = "notification_pending $pending";
        
        $this->addSystemMetrics($metrics, 'notification_service');
        
        return response(implode("\n", $metrics) . "\n")
            ->header('Content-Type', 'text/plain; version=0.0.4');
    }
    
    public function health()
    {
        try {
            DB::connection()->getPdo();
            return response()->json([
                'status' => 'healthy',
                'service' => 'notification-service',
                'timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'service' => 'notification-service',
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
