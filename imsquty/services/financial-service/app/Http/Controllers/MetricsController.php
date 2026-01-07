<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

/**
 * Metrics Controller - Financial Service
 * 
 * Exposes Prometheus-compatible metrics for financial monitoring
 */
class MetricsController extends Controller
{
    public function index()
    {
        $metrics = [];
        
        // ========================================
        // TRANSACTION METRICS
        // ========================================
        
        // Transactions today
        $transactionsToday = DB::table('transactions')
            ->whereDate('created_at', today())
            ->count();
        $metrics[] = "# HELP financial_transactions_today Transactions today";
        $metrics[] = "# TYPE financial_transactions_today counter";
        $metrics[] = "financial_transactions_today $transactionsToday";
        
        // Revenue today
        $revenueToday = DB::table('transactions')
            ->whereDate('created_at', today())
            ->where('type', 'income')
            ->sum('amount') ?? 0;
        $metrics[] = "# HELP financial_revenue_today Total revenue today";
        $metrics[] = "# TYPE financial_revenue_today counter";
        $metrics[] = "financial_revenue_today $revenueToday";
        
        // Expenses today
        $expensesToday = DB::table('transactions')
            ->whereDate('created_at', today())
            ->where('type', 'expense')
            ->sum('amount') ?? 0;
        $metrics[] = "# HELP financial_expenses_today Total expenses today";
        $metrics[] = "# TYPE financial_expenses_today counter";
        $metrics[] = "financial_expenses_today $expensesToday";
        
        // ========================================
        // INVOICE METRICS
        // ========================================
        
        // Outstanding invoices
        $outstandingInvoices = DB::table('invoices')
            ->where('status', 'unpaid')
            ->count();
        $metrics[] = "# HELP financial_invoices_outstanding Unpaid invoices";
        $metrics[] = "# TYPE financial_invoices_outstanding gauge";
        $metrics[] = "financial_invoices_outstanding $outstandingInvoices";
        
        // Outstanding amount
        $outstandingAmount = DB::table('invoices')
            ->where('status', 'unpaid')
            ->sum('amount') ?? 0;
        $metrics[] = "# HELP financial_outstanding_amount Total unpaid amount";
        $metrics[] = "# TYPE financial_outstanding_amount gauge";
        $metrics[] = "financial_outstanding_amount $outstandingAmount";
        
        // Overdue invoices
        $overdueInvoices = DB::table('invoices')
            ->where('status', 'unpaid')
            ->where('due_date', '<', now())
            ->count();
        $metrics[] = "# HELP financial_invoices_overdue Overdue invoices";
        $metrics[] = "# TYPE financial_invoices_overdue gauge";
        $metrics[] = "financial_invoices_overdue $overdueInvoices";
        
        // ========================================
        // BUDGET METRICS
        // ========================================
        
        // Budget utilization
        $totalBudget = DB::table('budgets')
            ->where('year', now()->year)
            ->sum('allocated_amount') ?? 1;
        $totalSpent = DB::table('budgets')
            ->where('year', now()->year)
            ->sum('spent_amount') ?? 0;
        $budgetUtilization = $totalBudget > 0 ? round($totalSpent / $totalBudget, 4) : 0;
        $metrics[] = "# HELP financial_budget_utilization Budget utilization rate";
        $metrics[] = "# TYPE financial_budget_utilization gauge";
        $metrics[] = "financial_budget_utilization $budgetUtilization";
        
        // ========================================
        // PAYMENT METRICS
        // ========================================
        
        // Payment success rate (last 24h)
        $totalPayments = DB::table('payments')
            ->where('created_at', '>=', now()->subDay())
            ->count();
        $successfulPayments = DB::table('payments')
            ->where('created_at', '>=', now()->subDay())
            ->where('status', 'success')
            ->count();
        $successRate = $totalPayments > 0 ? round($successfulPayments / $totalPayments, 4) : 1.0;
        $metrics[] = "# HELP financial_payment_success_rate Payment success rate (24h)";
        $metrics[] = "# TYPE financial_payment_success_rate gauge";
        $metrics[] = "financial_payment_success_rate $successRate";
        
        // By payment method
        $byMethod = DB::table('payments')
            ->where('created_at', '>=', now()->subDays(30))
            ->select('payment_method', DB::raw('count(*) as count'))
            ->groupBy('payment_method')
            ->get();
        
        $metrics[] = "# HELP financial_by_payment_method Payments by method (30d)";
        $metrics[] = "# TYPE financial_by_payment_method gauge";
        foreach ($byMethod as $method) {
            $methodName = str_replace(' ', '_', strtolower($method->payment_method ?? 'unknown'));
            $metrics[] = "financial_by_payment_method{method=\"$methodName\"} {$method->count}";
        }
        
        $this->addSystemMetrics($metrics, 'financial_service');
        
        return response(implode("\n", $metrics) . "\n")
            ->header('Content-Type', 'text/plain; version=0.0.4');
    }
    
    public function health()
    {
        try {
            DB::connection()->getPdo();
            return response()->json([
                'status' => 'healthy',
                'service' => 'financial-service',
                'timestamp' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'unhealthy',
                'service' => 'financial-service',
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
