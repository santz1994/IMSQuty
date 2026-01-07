<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class PdfExportService
{
    public function generate(array $data, string $template, string $filename): string
    {
        $pdf = Pdf::loadView("reports.templates.{$template}", $data);
        
        $path = "reports/pdf/{$filename}";
        Storage::put($path, $pdf->output());
        
        return $path;
    }

    public function generateAssetReport(array $data): string
    {
        $filename = 'asset_report_' . date('YmdHis') . '.pdf';
        
        $reportData = [
            'title' => 'Asset Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'summary' => [
                'total_assets' => $data['total_assets'] ?? 0,
                'active_assets' => $data['active_assets'] ?? 0,
                'maintenance_due' => $data['maintenance_due'] ?? 0,
                'warranty_expiring' => $data['warranty_expiring'] ?? 0
            ],
            'assets' => $data['assets'] ?? [],
            'by_category' => $data['by_category'] ?? [],
            'by_location' => $data['by_location'] ?? []
        ];

        return $this->generate($reportData, 'asset', $filename);
    }

    public function generateTicketReport(array $data): string
    {
        $filename = 'ticket_report_' . date('YmdHis') . '.pdf';
        
        $reportData = [
            'title' => 'Ticket Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'summary' => [
                'total_tickets' => $data['total_tickets'] ?? 0,
                'open_tickets' => $data['open_tickets'] ?? 0,
                'resolved_tickets' => $data['resolved_tickets'] ?? 0,
                'avg_resolution_time' => $data['avg_resolution_time'] ?? 0
            ],
            'tickets' => $data['tickets'] ?? [],
            'by_priority' => $data['by_priority'] ?? [],
            'by_status' => $data['by_status'] ?? []
        ];

        return $this->generate($reportData, 'ticket', $filename);
    }

    public function generateFinancialReport(array $data): string
    {
        $filename = 'financial_report_' . date('YmdHis') . '.pdf';
        
        $reportData = [
            'title' => 'Financial Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'summary' => [
                'total_invoices' => $data['total_invoices'] ?? 0,
                'total_amount' => $data['total_amount'] ?? 0,
                'paid_amount' => $data['paid_amount'] ?? 0,
                'pending_amount' => $data['pending_amount'] ?? 0
            ],
            'invoices' => $data['invoices'] ?? [],
            'budgets' => $data['budgets'] ?? [],
            'expenses' => $data['expenses'] ?? []
        ];

        return $this->generate($reportData, 'financial', $filename);
    }

    public function generateInventoryReport(array $data): string
    {
        $filename = 'inventory_report_' . date('YmdHis') . '.pdf';
        
        $reportData = [
            'title' => 'Inventory Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'summary' => [
                'total_items' => $data['total_items'] ?? 0,
                'low_stock_items' => $data['low_stock_items'] ?? 0,
                'out_of_stock' => $data['out_of_stock'] ?? 0,
                'total_value' => $data['total_value'] ?? 0
            ],
            'items' => $data['items'] ?? [],
            'by_category' => $data['by_category'] ?? []
        ];

        return $this->generate($reportData, 'inventory', $filename);
    }

    public function generateUserReport(array $data): string
    {
        $filename = 'user_report_' . date('YmdHis') . '.pdf';
        
        $reportData = [
            'title' => 'User Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'summary' => [
                'total_users' => $data['total_users'] ?? 0,
                'active_users' => $data['active_users'] ?? 0,
                'inactive_users' => $data['inactive_users'] ?? 0
            ],
            'users' => $data['users'] ?? [],
            'by_role' => $data['by_role'] ?? [],
            'by_department' => $data['by_department'] ?? []
        ];

        return $this->generate($reportData, 'user', $filename);
    }
}
