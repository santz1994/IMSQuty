<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Metrics Controller - Ticket Service (Damage Reports)
 * 
 * Exposes Prometheus-compatible metrics for ticket/damage reporting monitoring
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
        // TICKET METRICS
        // ========================================
        
        // Total tickets
        $totalTickets = DB::table('tickets')->count();
        $metrics[] = "# HELP ticket_total Total tickets in system";
        $metrics[] = "# TYPE ticket_total gauge";
        $metrics[] = "ticket_total $totalTickets";
        
        // Tickets by status
        $ticketsByStatus = DB::table('tickets')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();
        
        $metrics[] = "# HELP ticket_by_status Tickets grouped by status";
        $metrics[] = "# TYPE ticket_by_status gauge";
        foreach ($ticketsByStatus as $stat) {
            $status = strtolower($stat->status);
            $metrics[] = "ticket_by_status{status=\"$status\"} {$stat->count}";
        }
        
        // Tickets by priority
        $ticketsByPriority = DB::table('tickets')
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->get();
        
        $metrics[] = "# HELP ticket_by_priority Tickets grouped by priority";
        $metrics[] = "# TYPE ticket_by_priority gauge";
        foreach ($ticketsByPriority as $prior) {
            $priority = strtolower($prior->priority);
            $metrics[] = "ticket_by_priority{priority=\"$priority\"} {$prior->count}";
        }
        
        // Tickets by category
        $ticketsByCategory = DB::table('tickets')
            ->select('category', DB::raw('count(*) as count'))
            ->groupBy('category')
            ->whereNotNull('category')
            ->get();
        
        $metrics[] = "# HELP ticket_by_category Tickets grouped by category";
        $metrics[] = "# TYPE ticket_by_category gauge";
        foreach ($ticketsByCategory as $cat) {
            $category = str_replace(' ', '_', strtolower($cat->category));
            $metrics[] = "ticket_by_category{category=\"$category\"} {$cat->count}";
        }
        
        // ========================================
        // TIME-BASED METRICS
        // ========================================
        
        // Tickets created today
        $createdToday = DB::table('tickets')
            ->whereDate('created_at', today())
            ->count();
        $metrics[] = "# HELP ticket_created_today Tickets created today";
        $metrics[] = "# TYPE ticket_created_today counter";
        $metrics[] = "ticket_created_today $createdToday";
        
        // Tickets resolved today
        $resolvedToday = DB::table('tickets')
            ->whereDate('resolved_at', today())
            ->count();
        $metrics[] = "# HELP ticket_resolved_today Tickets resolved today";
        $metrics[] = "# TYPE ticket_resolved_today counter";
        $metrics[] = "ticket_resolved_today $resolvedToday";
        
        // Average resolution time (in hours)
        $avgResolutionTime = DB::table('tickets')
            ->whereNotNull('resolved_at')
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, created_at, resolved_at)) as avg_hours')
            ->value('avg_hours') ?? 0;
        $metrics[] = "# HELP ticket_avg_resolution_time_hours Average resolution time in hours (30d)";
        $metrics[] = "# TYPE ticket_avg_resolution_time_hours gauge";
        $metrics[] = "ticket_avg_resolution_time_hours " . round($avgResolutionTime, 2);
        
        // ========================================
        // SLA METRICS
        // ========================================
        
        // Overdue tickets (past SLA)
        $overdueTickets = DB::table('tickets')
            ->where('status', '!=', 'closed')
            ->where('sla_due_at', '<', now())
            ->count();
        $metrics[] = "# HELP ticket_overdue Tickets past SLA deadline";
        $metrics[] = "# TYPE ticket_overdue gauge";
        $metrics[] = "ticket_overdue $overdueTickets";
        
        // SLA compliance rate (last 30 days)
        $totalResolved30d = DB::table('tickets')
            ->whereNotNull('resolved_at')
            ->where('resolved_at', '>=', now()->subDays(30))
            ->count();
        
        $metSla30d = DB::table('tickets')
            ->whereNotNull('resolved_at')
            ->where('resolved_at', '>=', now()->subDays(30))
            ->whereRaw('resolved_at <= sla_due_at')
            ->count();
        
        $slaComplianceRate = $totalResolved30d > 0 ? round($metSla30d / $totalResolved30d, 4) : 1.0;
        $metrics[] = "# HELP ticket_sla_compliance_rate SLA compliance rate (30d)";
        $metrics[] = "# TYPE ticket_sla_compliance_rate gauge";
        $metrics[] = "ticket_sla_compliance_rate $slaComplianceRate";
        
        // ========================================
        // ASSIGNMENT METRICS
        // ========================================
        
        // Unassigned tickets
        $unassignedTickets = DB::table('tickets')
            ->whereNull('assigned_to')
            ->where('status', '!=', 'closed')
            ->count();
        $metrics[] = "# HELP ticket_unassigned Unassigned open tickets";
        $metrics[] = "# TYPE ticket_unassigned gauge";
        $metrics[] = "ticket_unassigned $unassignedTickets";
        
        // Tickets by assignee (top 10)
        $ticketsByAssignee = DB::table('ticket_assignments')
            ->join('users', 'ticket_assignments.user_id', '=', 'users.id')
            ->select('users.name', DB::raw('count(*) as count'))
            ->where('ticket_assignments.status', 'active')
            ->groupBy('users.name')
            ->orderByDesc('count')
            ->limit(10)
            ->get();
        
        $metrics[] = "# HELP ticket_by_assignee Active tickets by assignee";
        $metrics[] = "# TYPE ticket_by_assignee gauge";
        foreach ($ticketsByAssignee as $assign) {
            $assignee = str_replace(' ', '_', strtolower($assign->name));
            $metrics[] = "ticket_by_assignee{assignee=\"$assignee\"} {$assign->count}";
        }
        
        // ========================================
        // COMMENT/INTERACTION METRICS
        // ========================================
        
        // Total comments (last 24h)
        $commentsToday = DB::table('ticket_comments')
            ->where('created_at', '>=', now()->subDay())
            ->count();
        $metrics[] = "# HELP ticket_comments_24h Comments added in last 24h";
        $metrics[] = "# TYPE ticket_comments_24h counter";
        $metrics[] = "ticket_comments_24h $commentsToday";
        
        // Average comments per ticket
        $avgComments = DB::table('ticket_comments')
            ->selectRaw('COUNT(*) / COUNT(DISTINCT ticket_id) as avg')
            ->value('avg') ?? 0;
        $metrics[] = "# HELP ticket_avg_comments Average comments per ticket";
        $metrics[] = "# TYPE ticket_avg_comments gauge";
        $metrics[] = "ticket_avg_comments " . round($avgComments, 2);
        
        // ========================================
        // SYSTEM HEALTH
        // ========================================
        
        $this->addSystemMetrics($metrics, 'ticket_service');
        
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
                'service' => 'ticket-service',
                'timestamp' => now()->toIso8601String(),
                'checks' => [
                    'database' => 'ok',
                    'cache' => 'ok'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'service' => 'ticket-service',
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
        
        $uptime = Cache::remember("{$serviceName}_start_time", 3600, function() {
            return now();
        });
        $uptimeSeconds = now()->diffInSeconds($uptime);
        $metrics[] = "# HELP {$serviceName}_uptime_seconds Service uptime in seconds";
        $metrics[] = "# TYPE {$serviceName}_uptime_seconds counter";
        $metrics[] = "{$serviceName}_uptime_seconds $uptimeSeconds";
        
        $metrics[] = "# HELP {$serviceName}_health_status Service health (1=healthy, 0=unhealthy)";
        $metrics[] = "# TYPE {$serviceName}_health_status gauge";
        $metrics[] = "{$serviceName}_health_status 1";
    }
}
