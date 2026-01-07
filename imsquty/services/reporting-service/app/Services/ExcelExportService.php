<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\AssetReportExport;
use App\Exports\TicketReportExport;
use App\Exports\FinancialReportExport;
use App\Exports\InventoryReportExport;
use App\Exports\UserReportExport;

class ExcelExportService
{
    public function generateAssetReport(array $data): string
    {
        $filename = 'asset_report_' . date('YmdHis') . '.xlsx';
        $path = "reports/excel/{$filename}";
        
        Excel::store(new AssetReportExport($data), $path);
        
        return $path;
    }

    public function generateTicketReport(array $data): string
    {
        $filename = 'ticket_report_' . date('YmdHis') . '.xlsx';
        $path = "reports/excel/{$filename}";
        
        Excel::store(new TicketReportExport($data), $path);
        
        return $path;
    }

    public function generateFinancialReport(array $data): string
    {
        $filename = 'financial_report_' . date('YmdHis') . '.xlsx';
        $path = "reports/excel/{$filename}";
        
        Excel::store(new FinancialReportExport($data), $path);
        
        return $path;
    }

    public function generateInventoryReport(array $data): string
    {
        $filename = 'inventory_report_' . date('YmdHis') . '.xlsx';
        $path = "reports/excel/{$filename}";
        
        Excel::store(new InventoryReportExport($data), $path);
        
        return $path;
    }

    public function generateUserReport(array $data): string
    {
        $filename = 'user_report_' . date('YmdHis') . '.xlsx';
        $path = "reports/excel/{$filename}";
        
        Excel::store(new UserReportExport($data), $path);
        
        return $path;
    }
}
