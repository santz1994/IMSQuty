<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ServiceIntegrationClient
{
    private string $assetServiceUrl;
    private string $ticketServiceUrl;
    private string $financialServiceUrl;
    private string $inventoryServiceUrl;
    private string $userServiceUrl;
    private string $authToken;

    public function __construct()
    {
        $this->assetServiceUrl = env('ASSET_SERVICE_URL', 'http://asset-service:8001/api/v1');
        $this->ticketServiceUrl = env('TICKET_SERVICE_URL', 'http://ticket-service:8002/api/v1');
        $this->financialServiceUrl = env('FINANCIAL_SERVICE_URL', 'http://financial-service:8005/api/v1');
        $this->inventoryServiceUrl = env('INVENTORY_SERVICE_URL', 'http://inventory-service:8006/api/v1');
        $this->userServiceUrl = env('USER_SERVICE_URL', 'http://user-service:8007/api/v1');
        $this->authToken = request()->bearerToken() ?? '';
    }

    /**
     * Get asset data for reporting
     */
    public function getAssetData(array $parameters = []): array
    {
        try {
            $response = Http::withToken($this->authToken)
                ->timeout(30)
                ->get("{$this->assetServiceUrl}/assets", $parameters);

            if ($response->successful()) {
                $data = $response->json('data');
                
                // Get statistics
                $stats = Http::withToken($this->authToken)
                    ->get("{$this->assetServiceUrl}/assets/statistics")
                    ->json('data');

                return [
                    'total_assets' => $stats['total_assets'] ?? 0,
                    'active_assets' => $stats['active'] ?? 0,
                    'inactive_assets' => $stats['inactive'] ?? 0,
                    'maintenance_due' => $stats['maintenance_due'] ?? 0,
                    'warranty_expiring' => $stats['warranty_expiring_30days'] ?? 0,
                    'assets' => $data['data'] ?? [],
                    'by_category' => $stats['by_category'] ?? [],
                    'by_location' => $stats['by_location'] ?? [],
                    'by_status' => $stats['by_status'] ?? []
                ];
            }

            return $this->getEmptyAssetData();
        } catch (\Exception $e) {
            Log::error('Failed to fetch asset data: ' . $e->getMessage());
            return $this->getEmptyAssetData();
        }
    }

    /**
     * Get ticket data for reporting
     */
    public function getTicketData(array $parameters = []): array
    {
        try {
            $response = Http::withToken($this->authToken)
                ->timeout(30)
                ->get("{$this->ticketServiceUrl}/tickets", $parameters);

            if ($response->successful()) {
                $data = $response->json('data');
                
                // Get statistics
                $stats = Http::withToken($this->authToken)
                    ->get("{$this->ticketServiceUrl}/tickets/statistics")
                    ->json('data');

                return [
                    'total_tickets' => $stats['total'] ?? 0,
                    'open_tickets' => $stats['open'] ?? 0,
                    'in_progress_tickets' => $stats['in_progress'] ?? 0,
                    'resolved_tickets' => $stats['resolved'] ?? 0,
                    'avg_resolution_time' => $stats['avg_resolution_time_hours'] ?? 0,
                    'tickets' => $data['data'] ?? [],
                    'by_priority' => $stats['by_priority'] ?? [],
                    'by_status' => $stats['by_status'] ?? [],
                    'by_category' => $stats['by_category'] ?? []
                ];
            }

            return $this->getEmptyTicketData();
        } catch (\Exception $e) {
            Log::error('Failed to fetch ticket data: ' . $e->getMessage());
            return $this->getEmptyTicketData();
        }
    }

    /**
     * Get financial data for reporting
     */
    public function getFinancialData(array $parameters = []): array
    {
        try {
            // Get financial summary
            $summary = Http::withToken($this->authToken)
                ->timeout(30)
                ->get("{$this->financialServiceUrl}/financial-summary")
                ->json('data');

            // Get invoices
            $invoices = Http::withToken($this->authToken)
                ->get("{$this->financialServiceUrl}/invoices", $parameters)
                ->json('data');

            // Get budgets
            $budgets = Http::withToken($this->authToken)
                ->get("{$this->financialServiceUrl}/budgets")
                ->json('data');

            // Get expenses
            $expenses = Http::withToken($this->authToken)
                ->get("{$this->financialServiceUrl}/expenses", $parameters)
                ->json('data');

            return [
                'total_invoices' => $summary['total_invoices'] ?? 0,
                'pending_invoices' => $summary['pending_invoices'] ?? 0,
                'paid_invoices' => ($summary['total_invoices'] ?? 0) - ($summary['pending_invoices'] ?? 0),
                'overdue_invoices' => $summary['overdue_invoices'] ?? 0,
                'total_amount' => $summary['total_invoice_amount'] ?? 0,
                'paid_amount' => ($summary['total_invoice_amount'] ?? 0) - ($summary['pending_amount'] ?? 0),
                'pending_amount' => $summary['pending_amount'] ?? 0,
                'invoices' => $invoices['data'] ?? [],
                'budgets' => $budgets['data'] ?? [],
                'expenses' => $expenses['data'] ?? [],
                'total_budget' => $summary['total_budget_amount'] ?? 0,
                'total_spent' => $summary['total_spent_amount'] ?? 0
            ];
        } catch (\Exception $e) {
            Log::error('Failed to fetch financial data: ' . $e->getMessage());
            return $this->getEmptyFinancialData();
        }
    }

    /**
     * Get inventory data for reporting
     */
    public function getInventoryData(array $parameters = []): array
    {
        try {
            $response = Http::withToken($this->authToken)
                ->timeout(30)
                ->get("{$this->inventoryServiceUrl}/items", $parameters);

            if ($response->successful()) {
                $data = $response->json('data');
                
                // Get statistics
                $stats = Http::withToken($this->authToken)
                    ->get("{$this->inventoryServiceUrl}/items/statistics")
                    ->json('data');

                return [
                    'total_items' => $stats['total_items'] ?? 0,
                    'low_stock_items' => $stats['low_stock'] ?? 0,
                    'out_of_stock' => $stats['out_of_stock'] ?? 0,
                    'total_value' => $stats['total_inventory_value'] ?? 0,
                    'items' => $data['data'] ?? [],
                    'by_category' => $stats['by_category'] ?? [],
                    'by_location' => $stats['by_location'] ?? []
                ];
            }

            return $this->getEmptyInventoryData();
        } catch (\Exception $e) {
            Log::error('Failed to fetch inventory data: ' . $e->getMessage());
            return $this->getEmptyInventoryData();
        }
    }

    /**
     * Get user data for reporting
     */
    public function getUserData(array $parameters = []): array
    {
        try {
            $response = Http::withToken($this->authToken)
                ->timeout(30)
                ->get("{$this->userServiceUrl}/users", $parameters);

            if ($response->successful()) {
                $data = $response->json('data');
                
                // Get statistics
                $stats = Http::withToken($this->authToken)
                    ->get("{$this->userServiceUrl}/users/statistics")
                    ->json('data');

                return [
                    'total_users' => $stats['total'] ?? 0,
                    'active_users' => $stats['active'] ?? 0,
                    'inactive_users' => $stats['inactive'] ?? 0,
                    'users' => $data['data'] ?? [],
                    'by_role' => $stats['by_role'] ?? [],
                    'by_department' => $stats['by_department'] ?? []
                ];
            }

            return $this->getEmptyUserData();
        } catch (\Exception $e) {
            Log::error('Failed to fetch user data: ' . $e->getMessage());
            return $this->getEmptyUserData();
        }
    }

    private function getEmptyAssetData(): array
    {
        return [
            'total_assets' => 0,
            'active_assets' => 0,
            'inactive_assets' => 0,
            'maintenance_due' => 0,
            'warranty_expiring' => 0,
            'assets' => [],
            'by_category' => [],
            'by_location' => [],
            'by_status' => []
        ];
    }

    private function getEmptyTicketData(): array
    {
        return [
            'total_tickets' => 0,
            'open_tickets' => 0,
            'in_progress_tickets' => 0,
            'resolved_tickets' => 0,
            'avg_resolution_time' => 0,
            'tickets' => [],
            'by_priority' => [],
            'by_status' => [],
            'by_category' => []
        ];
    }

    private function getEmptyFinancialData(): array
    {
        return [
            'total_invoices' => 0,
            'pending_invoices' => 0,
            'paid_invoices' => 0,
            'overdue_invoices' => 0,
            'total_amount' => 0,
            'paid_amount' => 0,
            'pending_amount' => 0,
            'invoices' => [],
            'budgets' => [],
            'expenses' => [],
            'total_budget' => 0,
            'total_spent' => 0
        ];
    }

    private function getEmptyInventoryData(): array
    {
        return [
            'total_items' => 0,
            'low_stock_items' => 0,
            'out_of_stock' => 0,
            'total_value' => 0,
            'items' => [],
            'by_category' => [],
            'by_location' => []
        ];
    }

    private function getEmptyUserData(): array
    {
        return [
            'total_users' => 0,
            'active_users' => 0,
            'inactive_users' => 0,
            'users' => [],
            'by_role' => [],
            'by_department' => []
        ];
    }
}
