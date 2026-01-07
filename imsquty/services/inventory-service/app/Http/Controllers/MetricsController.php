<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Metrics Controller - Inventory Service
 * 
 * Exposes Prometheus-compatible metrics for inventory monitoring
 */
class MetricsController extends Controller
{
    public function index()
    {
        $metrics = [];
        
        // ========================================
        // INVENTORY METRICS
        // ========================================
        
        // Total items
        $totalItems = DB::table('inventory_items')->count();
        $metrics[] = "# HELP inventory_total_items Total inventory items";
        $metrics[] = "# TYPE inventory_total_items gauge";
        $metrics[] = "inventory_total_items $totalItems";
        
        // Low stock items
        $lowStock = DB::table('inventory_items')
            ->whereRaw('quantity <= min_quantity')
            ->where('quantity', '>', 0)
            ->count();
        $metrics[] = "# HELP inventory_low_stock Items below minimum stock";
        $metrics[] = "# TYPE inventory_low_stock gauge";
        $metrics[] = "inventory_low_stock $lowStock";
        
        // Out of stock
        $outOfStock = DB::table('inventory_items')
            ->where('quantity', 0)
            ->count();
        $metrics[] = "# HELP inventory_out_of_stock Items with zero stock";
        $metrics[] = "# TYPE inventory_out_of_stock gauge";
        $metrics[] = "inventory_out_of_stock $outOfStock";
        
        // Total value
        $totalValue = DB::table('inventory_items')
            ->selectRaw('SUM(quantity * unit_price) as total')
            ->value('total') ?? 0;
        $metrics[] = "# HELP inventory_total_value Total inventory value";
        $metrics[] = "# TYPE inventory_total_value gauge";
        $metrics[] = "inventory_total_value $totalValue";
        
        // By category
        $byCategory = DB::table('inventory_items')
            ->join('categories', 'inventory_items.category_id', '=', 'categories.id')
            ->select('categories.name', DB::raw('count(*) as count'))
            ->groupBy('categories.name')
            ->get();
        
        $metrics[] = "# HELP inventory_by_category Items by category";
        $metrics[] = "# TYPE inventory_by_category gauge";
        foreach ($byCategory as $cat) {
            $category = str_replace(' ', '_', strtolower($cat->name));
            $metrics[] = "inventory_by_category{category=\"$category\"} {$cat->count}";
        }
        
        // By location
        $byLocation = DB::table('inventory_items')
            ->join('stock_locations', 'inventory_items.location_id', '=', 'stock_locations.id')
            ->select('stock_locations.name', DB::raw('SUM(quantity) as total'))
            ->groupBy('stock_locations.name')
            ->get();
        
        $metrics[] = "# HELP inventory_by_location Stock by location";
        $metrics[] = "# TYPE inventory_by_location gauge";
        foreach ($byLocation as $loc) {
            $location = str_replace(' ', '_', strtolower($loc->name));
            $metrics[] = "inventory_by_location{location=\"$location\"} {$loc->total}";
        }
        
        // Stock movements today
        $movementsToday = DB::table('stock_movements')
            ->whereDate('created_at', today())
            ->count();
        $metrics[] = "# HELP inventory_movements_today Stock movements today";
        $metrics[] = "# TYPE inventory_movements_today counter";
        $metrics[] = "inventory_movements_today $movementsToday";
        
        // Turnover rate (last 30d)
        $totalSold = DB::table('stock_movements')
            ->where('type', 'out')
            ->where('created_at', '>=', now()->subDays(30))
            ->sum('quantity') ?? 0;
        $avgStock = DB::table('inventory_items')->avg('quantity') ?? 1;
        $turnoverRate = $avgStock > 0 ? round($totalSold / ($avgStock * 30), 4) : 0;
        $metrics[] = "# HELP inventory_turnover_rate Inventory turnover rate (30d)";
        $metrics[] = "# TYPE inventory_turnover_rate gauge";
        $metrics[] = "inventory_turnover_rate $turnoverRate";
        
        $this->addSystemMetrics($metrics, 'inventory_service');
        
        return response(implode("\n", $metrics) . "\n")
            ->header('Content-Type', 'text/plain; version=0.0.4');
    }
    
    public function health()
    {
        try {
            DB::connection()->getPdo();
            return response()->json([
                'status' => 'healthy',
                'service' => 'inventory-service',
                'timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'service' => 'inventory-service',
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
