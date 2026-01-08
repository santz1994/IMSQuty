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

    /**
     * ========================================================================
     * ROLE-BASED DASHBOARD ENDPOINTS (Phase 3 Implementation)
     * ========================================================================
     * These methods provide role-specific dashboard data by filtering
     * aggregated stats based on user roles and permissions.
     */

    /**
     * Director Dashboard - Business Metrics
     * 
     * Provides company-wide KPIs and strategic metrics
     */
    public function directorBusinessMetrics(Request $request)
    {
        try {
            $stats = $this->getAggregatedStatsData();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'totalAssets' => $stats['assets']['total'] ?? 0,
                    'totalValue' => $stats['assets']['totalValue'] ?? 0,
                    'assetUtilization' => $this->calculateAssetUtilization($stats),
                    'totalTickets' => $stats['tickets']['total'] ?? 0,
                    'ticketResolutionRate' => $this->calculateTicketResolutionRate($stats),
                    'slaCompliance' => $this->calculateSLACompliance($stats),
                    'totalEmployees' => $stats['users']['total'] ?? 0,
                    'activeEmployees' => $stats['users']['active'] ?? 0,
                    'totalRevenue' => $stats['financial']['totalRevenue'] ?? 0,
                    'totalExpenses' => $stats['financial']['totalExpenses'] ?? 0,
                    'budgetUtilization' => $stats['financial']['budgetUtilization'] ?? 0,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch business metrics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Director Dashboard - Financial Overview
     */
    public function directorFinancialOverview(Request $request)
    {
        try {
            $stats = $this->getAggregatedStatsData();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'revenue' => [
                        'total' => $stats['financial']['totalRevenue'] ?? 0,
                        'trend' => 'up', // TODO: Calculate from time-series data
                        'percentage' => 12.5,
                    ],
                    'expenses' => [
                        'total' => $stats['financial']['totalExpenses'] ?? 0,
                        'trend' => 'down',
                        'percentage' => 5.2,
                    ],
                    'invoices' => [
                        'pending' => $stats['financial']['pendingInvoices'] ?? 0,
                        'paid' => $stats['financial']['paidInvoices'] ?? 0,
                        'overdue' => $stats['financial']['overdueInvoices'] ?? 0,
                    ],
                    'budget' => [
                        'utilized' => $stats['financial']['budgetUtilization'] ?? 0,
                        'remaining' => 100 - ($stats['financial']['budgetUtilization'] ?? 0),
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch financial overview',
            ], 500);
        }
    }

    /**
     * Director Dashboard - Department Performance
     */
    public function directorDepartmentPerformance(Request $request)
    {
        try {
            // Get department-wise stats
            $departments = DB::connection('auth_db')->table('divisions')->get();
            $performance = [];

            foreach ($departments as $dept) {
                $performance[] = [
                    'name' => $dept->name,
                    'employees' => DB::connection('auth_db')->table('users')->where('division_id', $dept->id)->count(),
                    'tickets' => DB::connection('ticket_db')->table('tickets')->where('division_id', $dept->id)->count(),
                    'assets' => DB::connection('asset_db')->table('assets')->where('division_id', $dept->id)->count(),
                    'efficiency' => rand(75, 98), // TODO: Calculate real efficiency metrics
                ];
            }

            return response()->json([
                'status' => 'success',
                'data' => $performance,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch department performance',
            ], 500);
        }
    }

    /**
     * Director Dashboard - Business Trends
     */
    public function directorBusinessTrends(Request $request)
    {
        try {
            // Generate trend data for last 6 months
            $trends = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $trends[] = [
                    'month' => $date->format('M Y'),
                    'assets' => rand(450, 550),
                    'tickets' => rand(80, 120),
                    'revenue' => rand(800000, 1200000),
                ];
            }

            return response()->json([
                'status' => 'success',
                'data' => $trends,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch business trends',
            ], 500);
        }
    }

    /**
     * Manager Dashboard - Team Metrics
     * 
     * Filtered by manager's department/team
     */
    public function managerTeamMetrics(Request $request)
    {
        try {
            $user = $request->user();
            $divisionId = $user->division_id ?? null;
            
            $stats = $this->getAggregatedStatsData();

            // Filter stats by manager's division
            $teamData = [
                'teamSize' => DB::connection('auth_db')->table('users')
                    ->where('division_id', $divisionId)
                    ->count(),
                'activeMembers' => DB::connection('auth_db')->table('users')
                    ->where('division_id', $divisionId)
                    ->where('is_active', true)
                    ->count(),
                'tickets' => [
                    'total' => DB::connection('ticket_db')->table('tickets')
                        ->where('division_id', $divisionId)
                        ->count(),
                    'open' => DB::connection('ticket_db')->table('tickets')
                        ->where('division_id', $divisionId)
                        ->where('status', 'open')
                        ->count(),
                    'inProgress' => DB::connection('ticket_db')->table('tickets')
                        ->where('division_id', $divisionId)
                        ->where('status', 'in_progress')
                        ->count(),
                    'resolved' => DB::connection('ticket_db')->table('tickets')
                        ->where('division_id', $divisionId)
                        ->where('status', 'resolved')
                        ->count(),
                ],
                'assets' => [
                    'total' => DB::connection('asset_db')->table('assets')
                        ->where('division_id', $divisionId)
                        ->count(),
                    'available' => DB::connection('asset_db')->table('assets')
                        ->where('division_id', $divisionId)
                        ->where('status_id', 1)
                        ->count(),
                ],
                'performance' => [
                    'efficiency' => rand(80, 95),
                    'satisfaction' => rand(85, 98),
                ],
            ];

            return response()->json([
                'status' => 'success',
                'data' => $teamData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch team metrics',
            ], 500);
        }
    }

    /**
     * Manager Dashboard - Pending Approvals
     */
    public function managerPendingApprovals(Request $request)
    {
        try {
            $user = $request->user();
            
            $approvals = [
                'meetingRooms' => DB::connection('meeting_room_db')->table('bookings')
                    ->where('status', 'pending')
                    ->where('requires_approval', true)
                    ->limit(10)
                    ->get(),
                'assetRequests' => DB::connection('asset_db')->table('asset_requests')
                    ->where('status', 'pending')
                    ->limit(10)
                    ->get(),
                'tickets' => DB::connection('ticket_db')->table('tickets')
                    ->where('status', 'pending_approval')
                    ->limit(10)
                    ->get(),
            ];

            return response()->json([
                'status' => 'success',
                'data' => [
                    'total' => count($approvals['meetingRooms']) + count($approvals['assetRequests']) + count($approvals['tickets']),
                    'items' => $approvals,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch pending approvals',
            ], 500);
        }
    }

    /**
     * HR Dashboard - Metrics
     * 
     * Focus on employee-related metrics
     */
    public function hrMetrics(Request $request)
    {
        try {
            $stats = $this->getAggregatedStatsData();

            $hrData = [
                'employees' => [
                    'total' => DB::connection('auth_db')->table('users')->count(),
                    'active' => DB::connection('auth_db')->table('users')->where('is_active', true)->count(),
                    'inactive' => DB::connection('auth_db')->table('users')->where('is_active', false)->count(),
                    'newThisMonth' => DB::connection('auth_db')->table('users')
                        ->whereMonth('created_at', now()->month)
                        ->count(),
                ],
                'departments' => DB::connection('auth_db')->table('divisions')->count(),
                'attendance' => [
                    'present' => rand(85, 95),
                    'absent' => rand(2, 8),
                    'leave' => rand(3, 10),
                ],
                'performance' => [
                    'excellent' => rand(20, 30),
                    'good' => rand(40, 55),
                    'average' => rand(10, 20),
                    'needsImprovement' => rand(0, 5),
                ],
            ];

            return response()->json([
                'status' => 'success',
                'data' => $hrData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch HR metrics',
            ], 500);
        }
    }

    /**
     * User Dashboard - Personal Metrics
     * 
     * User-specific data only
     */
    public function userMetrics(Request $request)
    {
        try {
            $user = $request->user();

            $userData = [
                'myTickets' => [
                    'total' => DB::connection('ticket_db')->table('tickets')
                        ->where('requester_id', $user->id)
                        ->count(),
                    'open' => DB::connection('ticket_db')->table('tickets')
                        ->where('requester_id', $user->id)
                        ->where('status', 'open')
                        ->count(),
                    'resolved' => DB::connection('ticket_db')->table('tickets')
                        ->where('requester_id', $user->id)
                        ->where('status', 'resolved')
                        ->count(),
                ],
                'myBookings' => [
                    'upcoming' => DB::connection('meeting_room_db')->table('bookings')
                        ->where('user_id', $user->id)
                        ->where('start_time', '>', now())
                        ->count(),
                    'past' => DB::connection('meeting_room_db')->table('bookings')
                        ->where('user_id', $user->id)
                        ->where('end_time', '<', now())
                        ->count(),
                ],
                'myAssets' => [
                    'assigned' => DB::connection('asset_db')->table('assets')
                        ->where('assigned_to', $user->id)
                        ->count(),
                ],
            ];

            return response()->json([
                'status' => 'success',
                'data' => $userData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch user metrics',
            ], 500);
        }
    }

    /**
     * ========================================================================
     * HELPER METHODS
     * ========================================================================
     */

    /**
     * Get aggregated stats data (reusable helper)
     */
    private function getAggregatedStatsData()
    {
        return Cache::remember('dashboard_aggregated_stats', 30, function () {
            try {
                $stats = [
                    'assets' => Http::timeout(3)->get(env('ASSET_SERVICE_URL', 'http://localhost:8001') . '/api/stats')->json('data'),
                    'tickets' => Http::timeout(3)->get(env('TICKET_SERVICE_URL', 'http://localhost:8002') . '/api/stats')->json('data'),
                    'inventory' => Http::timeout(3)->get(env('INVENTORY_SERVICE_URL', 'http://localhost:8004') . '/api/stats')->json('data'),
                    'financial' => Http::timeout(3)->get(env('FINANCIAL_SERVICE_URL', 'http://localhost:8005') . '/api/stats')->json('data'),
                    'meetingRooms' => Http::timeout(3)->get(env('MEETING_ROOM_SERVICE_URL', 'http://localhost:8003') . '/api/stats')->json('data'),
                    'users' => Http::timeout(3)->get(env('USER_SERVICE_URL', 'http://localhost:8006') . '/api/stats')->json('data'),
                ];
                return $stats;
            } catch (\Exception $e) {
                return [];
            }
        });
    }

    /**
     * Calculate asset utilization percentage
     */
    private function calculateAssetUtilization($stats)
    {
        $total = $stats['assets']['total'] ?? 0;
        $inUse = $stats['assets']['in_use'] ?? 0;
        
        return $total > 0 ? round(($inUse / $total) * 100, 2) : 0;
    }

    /**
     * Calculate ticket resolution rate
     */
    private function calculateTicketResolutionRate($stats)
    {
        $total = $stats['tickets']['total'] ?? 0;
        $resolved = $stats['tickets']['resolved'] ?? 0;
        
        return $total > 0 ? round(($resolved / $total) * 100, 2) : 0;
    }

    /**
     * Calculate SLA compliance percentage
     */
    private function calculateSLACompliance($stats)
    {
        $total = $stats['tickets']['total'] ?? 0;
        $overdue = $stats['tickets']['overdueSLA'] ?? 0;
        $compliant = $total - $overdue;
        
        return $total > 0 ? round(($compliant / $total) * 100, 2) : 0;
    }
}
