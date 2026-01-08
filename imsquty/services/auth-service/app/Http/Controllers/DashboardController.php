<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

/**
 * Dashboard Controller
 * 
 * Aggregates system-wide metrics and health checks
 */
class DashboardController extends Controller
{
    /**
     * Get comprehensive system health status
     * 
     * Aggregates health from all 10 microservices
     */
    public function systemHealth()
    {
        // Cache for 5 seconds to avoid hammering services
        return Cache::remember('dashboard_system_health', 5, function () {
            $services = [
                ['name' => 'Auth Service', 'url' => env('AUTH_SERVICE_URL', 'http://localhost:8000') . '/api/health', 'port' => 8000],
                ['name' => 'Asset Service', 'url' => env('ASSET_SERVICE_URL', 'http://localhost:8001') . '/api/health', 'port' => 8001],
                ['name' => 'Ticket Service', 'url' => env('TICKET_SERVICE_URL', 'http://localhost:8002') . '/api/health', 'port' => 8002],
                ['name' => 'Meeting Room Service', 'url' => env('MEETING_ROOM_SERVICE_URL', 'http://localhost:8003') . '/api/health', 'port' => 8003],
                ['name' => 'Inventory Service', 'url' => env('INVENTORY_SERVICE_URL', 'http://localhost:8004') . '/api/health', 'port' => 8004],
                ['name' => 'Financial Service', 'url' => env('FINANCIAL_SERVICE_URL', 'http://localhost:8005') . '/api/health', 'port' => 8005],
                ['name' => 'User Service', 'url' => env('USER_SERVICE_URL', 'http://localhost:8006') . '/api/health', 'port' => 8006],
                ['name' => 'Notification Service', 'url' => env('NOTIFICATION_SERVICE_URL', 'http://localhost:8007') . '/api/health', 'port' => 8007],
                ['name' => 'Reporting Service', 'url' => env('REPORTING_SERVICE_URL', 'http://localhost:8008') . '/api/health', 'port' => 8008],
                ['name' => 'Master Data Service', 'url' => env('MASTER_DATA_SERVICE_URL', 'http://localhost:8009') . '/api/health', 'port' => 8009],
            ];

            $healthResults = [];
            $healthyCount = 0;
            $downCount = 0;

            foreach ($services as $service) {
                try {
                    $startTime = microtime(true);
                    $response = Http::timeout(3)->get($service['url']);
                    $latency = round((microtime(true) - $startTime) * 1000);

                    $status = $response->successful() && $response->json('status') === 'healthy' ? 'healthy' : 'unhealthy';
                    
                    $healthResults[] = [
                        'name' => $service['name'],
                        'status' => $status,
                        'latency' => $latency,
                        'port' => $service['port'],
                        'timestamp' => now()->toIso8601String(),
                    ];

                    if ($status === 'healthy') $healthyCount++;
                } catch (\Exception $e) {
                    $healthResults[] = [
                        'name' => $service['name'],
                        'status' => 'down',
                        'latency' => 0,
                        'port' => $service['port'],
                        'error' => 'Connection failed',
                    ];
                    $downCount++;
                }
            }

            return response()->json([
                'status' => $downCount === 0 ? 'healthy' : ($downCount < 3 ? 'degraded' : 'unhealthy'),
                'data' => [
                    'services' => $healthResults,
                    'summary' => [
                        'total' => count($services),
                        'healthy' => $healthyCount,
                        'down' => $downCount,
                    ],
                    'timestamp' => now()->toIso8601String(),
                ],
            ]);
        });
    }

    /**
     * Get aggregated statistics from all services
     */
    public function aggregatedStats()
    {
        try {
            // Make parallel requests to all service stats endpoints
            $stats = [
                'assets' => Http::timeout(3)->get(env('ASSET_SERVICE_URL', 'http://localhost:8001') . '/api/stats')->json('data'),
                'tickets' => Http::timeout(3)->get(env('TICKET_SERVICE_URL', 'http://localhost:8002') . '/api/stats')->json('data'),
                'inventory' => Http::timeout(3)->get(env('INVENTORY_SERVICE_URL', 'http://localhost:8004') . '/api/stats')->json('data'),
                'financial' => Http::timeout(3)->get(env('FINANCIAL_SERVICE_URL', 'http://localhost:8005') . '/api/stats')->json('data'),
                'meetingRooms' => Http::timeout(3)->get(env('MEETING_ROOM_SERVICE_URL', 'http://localhost:8003') . '/api/stats')->json('data'),
                'users' => Http::timeout(3)->get(env('USER_SERVICE_URL', 'http://localhost:8006') . '/api/stats')->json('data'),
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch aggregated stats',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get quick stats for dashboard cards
     */
    public function quickStats()
    {
        try {
            return response()->json([
                'status' => 'success',
                'data' => [
                    'totalAssets' => DB::connection('asset_db')->table('assets')->count(),
                    'openTickets' => DB::connection('ticket_db')->table('tickets')->whereIn('status', ['open', 'in_progress'])->count(),
                    'todayBookings' => DB::connection('meeting_room_db')->table('bookings')->whereDate('start_time', today())->count(),
                    'lowStockItems' => DB::connection('inventory_db')->table('inventory_items')->where('quantity', '<=', DB::raw('minimum_stock'))->count(),
                    'pendingInvoices' => DB::connection('financial_db')->table('invoices')->where('status', 'pending')->count(),
                    'activeUsers' => DB::connection('auth_db')->table('users')->where('is_active', true)->count(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch quick stats',
            ], 500);
        }
    }
}
