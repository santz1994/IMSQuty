<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Metrics Controller - Meeting Room Service
 * 
 * Exposes Prometheus-compatible metrics for meeting room booking monitoring
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
        // MEETING ROOM METRICS
        // ========================================
        
        // Total meeting rooms
        $totalRooms = DB::table('meeting_rooms')->count();
        $metrics[] = "# HELP room_total Total meeting rooms";
        $metrics[] = "# TYPE room_total gauge";
        $metrics[] = "room_total $totalRooms";
        
        // Rooms by status
        $roomsByStatus = DB::table('meeting_rooms')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();
        
        $metrics[] = "# HELP room_by_status Rooms grouped by status";
        $metrics[] = "# TYPE room_by_status gauge";
        foreach ($roomsByStatus as $stat) {
            $status = strtolower($stat->status);
            $metrics[] = "room_by_status{status=\"$status\"} {$stat->count}";
        }
        
        // Rooms by capacity range
        $roomsByCapacity = DB::table('meeting_rooms')
            ->selectRaw("
                CASE 
                    WHEN capacity <= 5 THEN 'small'
                    WHEN capacity <= 10 THEN 'medium'
                    WHEN capacity <= 20 THEN 'large'
                    ELSE 'extra_large'
                END as capacity_range,
                COUNT(*) as count
            ")
            ->groupBy('capacity_range')
            ->get();
        
        $metrics[] = "# HELP room_by_capacity Rooms grouped by capacity range";
        $metrics[] = "# TYPE room_by_capacity gauge";
        foreach ($roomsByCapacity as $cap) {
            $metrics[] = "room_by_capacity{range=\"{$cap->capacity_range}\"} {$cap->count}";
        }
        
        // ========================================
        // BOOKING METRICS
        // ========================================
        
        // Total bookings
        $totalBookings = DB::table('bookings')->count();
        $metrics[] = "# HELP booking_total Total bookings";
        $metrics[] = "# TYPE booking_total counter";
        $metrics[] = "booking_total $totalBookings";
        
        // Bookings today
        $bookingsToday = DB::table('bookings')
            ->whereDate('start_time', today())
            ->count();
        $metrics[] = "# HELP booking_total_today Bookings for today";
        $metrics[] = "# TYPE booking_total_today gauge";
        $metrics[] = "booking_total_today $bookingsToday";
        
        // Bookings by status
        $bookingsByStatus = DB::table('bookings')
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();
        
        $metrics[] = "# HELP booking_by_status Bookings grouped by status";
        $metrics[] = "# TYPE booking_by_status gauge";
        foreach ($bookingsByStatus as $stat) {
            $status = strtolower($stat->status);
            $metrics[] = "booking_by_status{status=\"$status\"} {$stat->count}";
        }
        
        // Upcoming bookings (next 24h)
        $upcomingBookings = DB::table('bookings')
            ->where('start_time', '>=', now())
            ->where('start_time', '<=', now()->addDay())
            ->where('status', 'confirmed')
            ->count();
        $metrics[] = "# HELP booking_upcoming_24h Upcoming bookings in next 24 hours";
        $metrics[] = "# TYPE booking_upcoming_24h gauge";
        $metrics[] = "booking_upcoming_24h $upcomingBookings";
        
        // ========================================
        // UTILIZATION METRICS
        // ========================================
        
        // Room utilization rate (today)
        $totalSlots = $totalRooms * 10; // Assume 10 available slots per day (9am-7pm)
        $bookedSlots = DB::table('bookings')
            ->whereDate('start_time', today())
            ->where('status', 'confirmed')
            ->count();
        $utilizationRate = $totalSlots > 0 ? round($bookedSlots / $totalSlots, 4) : 0;
        $metrics[] = "# HELP room_utilization_rate Room utilization rate for today";
        $metrics[] = "# TYPE room_utilization_rate gauge";
        $metrics[] = "room_utilization_rate $utilizationRate";
        
        // Average booking duration (hours)
        $avgDuration = DB::table('bookings')
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, start_time, end_time)) as avg_hours')
            ->value('avg_hours') ?? 0;
        $metrics[] = "# HELP booking_avg_duration_hours Average booking duration in hours";
        $metrics[] = "# TYPE booking_avg_duration_hours gauge";
        $metrics[] = "booking_avg_duration_hours " . round($avgDuration, 2);
        
        // ========================================
        // POPULARITY METRICS
        // ========================================
        
        // Most popular rooms (top 5)
        $popularRooms = DB::table('bookings')
            ->join('meeting_rooms', 'bookings.room_id', '=', 'meeting_rooms.id')
            ->select('meeting_rooms.name', DB::raw('count(*) as booking_count'))
            ->where('bookings.created_at', '>=', now()->subDays(30))
            ->groupBy('meeting_rooms.name')
            ->orderByDesc('booking_count')
            ->limit(5)
            ->get();
        
        $metrics[] = "# HELP room_popularity Booking count by room (30d, top 5)";
        $metrics[] = "# TYPE room_popularity gauge";
        foreach ($popularRooms as $room) {
            $roomName = str_replace(' ', '_', strtolower($room->name));
            $metrics[] = "room_popularity{room=\"$roomName\"} {$room->booking_count}";
        }
        
        // ========================================
        // NO-SHOW METRICS
        // ========================================
        
        // No-show rate (last 30 days)
        $completedBookings = DB::table('bookings')
            ->where('created_at', '>=', now()->subDays(30))
            ->whereIn('status', ['completed', 'no_show'])
            ->count();
        
        $noShows = DB::table('bookings')
            ->where('created_at', '>=', now()->subDays(30))
            ->where('status', 'no_show')
            ->count();
        
        $noShowRate = $completedBookings > 0 ? round($noShows / $completedBookings, 4) : 0;
        $metrics[] = "# HELP booking_no_show_rate No-show rate (30d)";
        $metrics[] = "# TYPE booking_no_show_rate gauge";
        $metrics[] = "booking_no_show_rate $noShowRate";
        
        // ========================================
        // CANCELLATION METRICS
        // ========================================
        
        // Cancelled bookings (last 24h)
        $cancelledToday = DB::table('bookings')
            ->where('updated_at', '>=', now()->subDay())
            ->where('status', 'cancelled')
            ->count();
        $metrics[] = "# HELP booking_cancelled_24h Bookings cancelled in last 24h";
        $metrics[] = "# TYPE booking_cancelled_24h counter";
        $metrics[] = "booking_cancelled_24h $cancelledToday";
        
        // Cancellation rate (30d)
        $totalBookings30d = DB::table('bookings')
            ->where('created_at', '>=', now()->subDays(30))
            ->count();
        
        $cancelled30d = DB::table('bookings')
            ->where('created_at', '>=', now()->subDays(30))
            ->where('status', 'cancelled')
            ->count();
        
        $cancellationRate = $totalBookings30d > 0 ? round($cancelled30d / $totalBookings30d, 4) : 0;
        $metrics[] = "# HELP booking_cancellation_rate Cancellation rate (30d)";
        $metrics[] = "# TYPE booking_cancellation_rate gauge";
        $metrics[] = "booking_cancellation_rate $cancellationRate";
        
        // ========================================
        // SYSTEM HEALTH
        // ========================================
        
        $this->addSystemMetrics($metrics, 'meeting_room_service');
        
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
                'service' => 'meeting-room-service',
                'timestamp' => now()->toIso8601String(),
                'checks' => [
                    'database' => 'ok',
                    'cache' => 'ok'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'service' => 'meeting-room-service',
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
            // Skip
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
