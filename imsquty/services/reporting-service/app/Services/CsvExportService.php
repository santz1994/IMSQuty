<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use League\Csv\Writer;

class CsvExportService
{
    public function generate(array $data, array $headers, string $filename): string
    {
        $path = "reports/csv/{$filename}";
        $csv = Writer::createFromString('');
        
        $csv->insertOne($headers);
        $csv->insertAll($data);
        
        Storage::put($path, $csv->toString());
        
        return $path;
    }

    public function generateAssetReport(array $data): string
    {
        $filename = 'asset_report_' . date('YmdHis') . '.csv';
        
        $headers = ['ID', 'Name', 'Tag', 'Category', 'Status', 'Location', 'Assigned To', 'Purchase Date', 'Warranty Expiry'];
        
        $rows = array_map(function ($asset) {
            return [
                $asset['id'] ?? '',
                $asset['name'] ?? '',
                $asset['asset_tag'] ?? '',
                $asset['category'] ?? '',
                $asset['status'] ?? '',
                $asset['location'] ?? '',
                $asset['assigned_to'] ?? '',
                $asset['purchase_date'] ?? '',
                $asset['warranty_expiry'] ?? ''
            ];
        }, $data['assets'] ?? []);

        return $this->generate($rows, $headers, $filename);
    }

    public function generateTicketReport(array $data): string
    {
        $filename = 'ticket_report_' . date('YmdHis') . '.csv';
        
        $headers = ['ID', 'Title', 'Status', 'Priority', 'Assigned To', 'Created At', 'Resolved At', 'Resolution Time'];
        
        $rows = array_map(function ($ticket) {
            return [
                $ticket['id'] ?? '',
                $ticket['title'] ?? '',
                $ticket['status'] ?? '',
                $ticket['priority'] ?? '',
                $ticket['assigned_to'] ?? '',
                $ticket['created_at'] ?? '',
                $ticket['resolved_at'] ?? '',
                $ticket['resolution_time'] ?? ''
            ];
        }, $data['tickets'] ?? []);

        return $this->generate($rows, $headers, $filename);
    }

    public function generateFinancialReport(array $data): string
    {
        $filename = 'financial_report_' . date('YmdHis') . '.csv';
        
        $headers = ['Invoice Number', 'Customer', 'Amount', 'Tax', 'Total', 'Status', 'Due Date', 'Paid Date'];
        
        $rows = array_map(function ($invoice) {
            return [
                $invoice['invoice_number'] ?? '',
                $invoice['customer_name'] ?? '',
                $invoice['amount'] ?? '',
                $invoice['tax'] ?? '',
                $invoice['total'] ?? '',
                $invoice['status'] ?? '',
                $invoice['due_date'] ?? '',
                $invoice['paid_date'] ?? ''
            ];
        }, $data['invoices'] ?? []);

        return $this->generate($rows, $headers, $filename);
    }

    public function generateInventoryReport(array $data): string
    {
        $filename = 'inventory_report_' . date('YmdHis') . '.csv';
        
        $headers = ['ID', 'Name', 'SKU', 'Category', 'Quantity', 'Unit Price', 'Total Value', 'Location'];
        
        $rows = array_map(function ($item) {
            return [
                $item['id'] ?? '',
                $item['name'] ?? '',
                $item['sku'] ?? '',
                $item['category'] ?? '',
                $item['quantity'] ?? '',
                $item['unit_price'] ?? '',
                $item['total_value'] ?? '',
                $item['location'] ?? ''
            ];
        }, $data['items'] ?? []);

        return $this->generate($rows, $headers, $filename);
    }

    public function generateUserReport(array $data): string
    {
        $filename = 'user_report_' . date('YmdHis') . '.csv';
        
        $headers = ['ID', 'Name', 'Email', 'Role', 'Department', 'Status', 'Last Login', 'Created At'];
        
        $rows = array_map(function ($user) {
            return [
                $user['id'] ?? '',
                $user['name'] ?? '',
                $user['email'] ?? '',
                $user['role'] ?? '',
                $user['department'] ?? '',
                $user['status'] ?? '',
                $user['last_login'] ?? '',
                $user['created_at'] ?? ''
            ];
        }, $data['users'] ?? []);

        return $this->generate($rows, $headers, $filename);
    }
}
