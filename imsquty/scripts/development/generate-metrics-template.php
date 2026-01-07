#!/usr/bin/env php
<?php

/**
 * Metrics Endpoint Generator for All Services
 * 
 * This script generates MetricsController for each microservice
 * with service-specific metrics.
 */

$services = [
    'asset-service' => [
        'port' => 8001,
        'metrics' => [
            'total_assets' => 'Total assets in system',
            'assets_by_status' => 'Assets grouped by status (active/maintenance/retired)',
            'assets_by_category' => 'Assets grouped by category',
            'assets_by_location' => 'Assets grouped by location',
            'depreciation_value' => 'Total depreciation value',
            'maintenance_due' => 'Assets with maintenance due',
            'asset_utilization_rate' => 'Asset utilization percentage',
        ],
        'tables' => ['assets', 'asset_assignments', 'asset_maintenances']
    ],
    'ticket-service' => [
        'port' => 8002,
        'metrics' => [
            'total_tickets' => 'Total damage/service tickets',
            'tickets_by_status' => 'Tickets by status (open/in_progress/resolved/closed)',
            'tickets_by_priority' => 'Tickets by priority (low/medium/high/critical)',
            'tickets_by_category' => 'Tickets by category',
            'average_resolution_time' => 'Average ticket resolution time (hours)',
            'sla_compliance_rate' => 'SLA compliance percentage',
            'overdue_tickets' => 'Number of overdue tickets',
        ],
        'tables' => ['tickets', 'ticket_assignments', 'ticket_comments']
    ],
    'meeting-room-service' => [
        'port' => 8003,
        'metrics' => [
            'total_rooms' => 'Total meeting rooms',
            'total_bookings_today' => 'Bookings for today',
            'room_utilization_rate' => 'Room utilization percentage',
            'bookings_by_status' => 'Bookings by status (pending/confirmed/cancelled)',
            'average_booking_duration' => 'Average booking duration (hours)',
            'popular_rooms' => 'Most booked rooms',
            'no_show_rate' => 'No-show percentage',
        ],
        'tables' => ['meeting_rooms', 'bookings']
    ],
    'inventory-service' => [
        'port' => 8004,
        'metrics' => [
            'total_items' => 'Total inventory items',
            'low_stock_items' => 'Items below minimum stock level',
            'out_of_stock_items' => 'Items with zero stock',
            'total_stock_value' => 'Total inventory value',
            'items_by_category' => 'Items grouped by category',
            'items_by_location' => 'Items grouped by storage location',
            'stock_turnover_rate' => 'Inventory turnover ratio',
        ],
        'tables' => ['inventory_items', 'stock_movements', 'stock_locations']
    ],
    'financial-service' => [
        'port' => 8005,
        'metrics' => [
            'total_transactions_today' => 'Financial transactions today',
            'total_revenue_today' => 'Total revenue today',
            'total_expenses_today' => 'Total expenses today',
            'outstanding_invoices' => 'Number of unpaid invoices',
            'outstanding_amount' => 'Total outstanding payment amount',
            'budget_utilization' => 'Budget utilization percentage',
            'payment_success_rate' => 'Payment processing success rate',
        ],
        'tables' => ['transactions', 'invoices', 'budgets', 'payments']
    ],
    'user-service' => [
        'port' => 8006,
        'metrics' => [
            'total_users' => 'Total users in system',
            'active_users_30d' => 'Active users in last 30 days',
            'users_by_department' => 'Users grouped by department',
            'users_by_position' => 'Users grouped by position',
            'new_users_this_month' => 'New user registrations this month',
            'user_retention_rate' => 'User retention percentage',
        ],
        'tables' => ['users', 'user_profiles', 'user_activity_logs']
    ],
    'notification-service' => [
        'port' => 8007,
        'metrics' => [
            'notifications_sent_today' => 'Notifications sent today',
            'notifications_by_channel' => 'Notifications by channel (email/sms/push/in_app)',
            'notifications_by_status' => 'Notifications by status (pending/sent/failed)',
            'notification_delivery_rate' => 'Delivery success rate',
            'notification_read_rate' => 'Read rate percentage',
            'notifications_pending' => 'Pending notifications in queue',
        ],
        'tables' => ['notifications', 'notification_logs']
    ],
    'reporting-service' => [
        'port' => 8008,
        'metrics' => [
            'reports_generated_today' => 'Reports generated today',
            'reports_by_type' => 'Reports by type',
            'report_generation_time_avg' => 'Average report generation time (seconds)',
            'scheduled_reports' => 'Active scheduled reports',
            'failed_reports' => 'Failed report generations',
            'report_export_count' => 'Number of exports (PDF/Excel)',
        ],
        'tables' => ['reports', 'report_schedules', 'report_exports']
    ],
    'master-data-service' => [
        'port' => 8009,
        'metrics' => [
            'total_categories' => 'Total categories',
            'total_locations' => 'Total locations',
            'total_departments' => 'Total departments',
            'total_vendors' => 'Total vendors/suppliers',
            'total_configurations' => 'Total system configurations',
            'cache_hit_rate' => 'Master data cache hit rate',
        ],
        'tables' => ['categories', 'locations', 'departments', 'vendors', 'configurations']
    ],
];

$authServiceMetrics = <<<'PHP'
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class MetricsController extends Controller
{
    public function index()
    {
        $metrics = [];
        
        // Auth-specific metrics...
        // (Already created above)
        
        return response(implode("\n", $metrics) . "\n")
            ->header('Content-Type', 'text/plain; version=0.0.4');
    }
    
    public function health()
    {
        try {
            DB::connection()->getPdo();
            
            return response()->json([
                'status' => 'healthy',
                'service' => 'SERVICE_NAME',
                'timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'service' => 'SERVICE_NAME',
                'error' => $e->getMessage()
            ], 503);
        }
    }
}
PHP;

echo "===========================================\n";
echo "   METRICS CONTROLLER TEMPLATES\n";
echo "   For IMSQuty Microservices\n";
echo "===========================================\n\n";

foreach ($services as $serviceName => $config) {
    echo "Service: $serviceName\n";
    echo "Port: {$config['port']}\n";
    echo "Metrics:\n";
    foreach ($config['metrics'] as $metric => $description) {
        echo "  - $metric: $description\n";
    }
    echo "\n";
}

echo "\n===========================================\n";
echo "   IMPLEMENTATION INSTRUCTIONS\n";
echo "===========================================\n\n";

echo "1. For each service, create:\n";
echo "   app/Http/Controllers/MetricsController.php\n\n";

echo "2. Add routes in routes/api.php:\n";
echo "   Route::get('/health', [MetricsController::class, 'health']);\n";
echo "   Route::get('/metrics', [MetricsController::class, 'index']);\n\n";

echo "3. Implement service-specific metrics using:\n";
echo "   - DB::table()->count() for counts\n";
echo "   - DB::table()->sum() for totals\n";
echo "   - DB::table()->avg() for averages\n";
echo "   - DB::table()->groupBy() for breakdowns\n\n";

echo "4. Test endpoints:\n";
foreach ($services as $serviceName => $config) {
    echo "   curl http://localhost:{$config['port']}/api/metrics\n";
}

echo "\n5. Verify in Prometheus:\n";
echo "   http://localhost:9090/targets\n";
echo "   All services should show UP status\n\n";

echo "===========================================\n";
echo "   NEXT: Create MetricsController for each service\n";
echo "===========================================\n";

?>
