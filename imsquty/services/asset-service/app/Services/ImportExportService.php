<?php

namespace App\Services;

use App\Models\Asset;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Writer\Csv;
use Carbon\Carbon;

/**
 * Import/Export Service
 * 
 * Handles bulk import and export operations for assets
 * Supports Excel (XLSX) and CSV formats
 */
class ImportExportService
{
    /**
     * Import assets from Excel file
     * 
     * @param UploadedFile $file
     * @return array ['success' => int, 'failed' => int, 'errors' => array]
     */
    public function importAssetsFromExcel(UploadedFile $file): array
    {
        $results = [
            'success' => 0,
            'failed' => 0,
            'errors' => []
        ];

        try {
            // Load spreadsheet
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();

            // Skip header row
            array_shift($rows);

            DB::beginTransaction();

            foreach ($rows as $index => $row) {
                $rowNumber = $index + 2; // +2 because we skipped header and array is 0-indexed

                try {
                    // Validate required fields
                    if (empty($row[0]) || empty($row[1])) {
                        $results['failed']++;
                        $results['errors'][] = "Row {$rowNumber}: Missing required fields (code or name)";
                        continue;
                    }

                    // Create asset
                    Asset::create([
                        'code' => $row[0],
                        'name' => $row[1],
                        'description' => $row[2] ?? null,
                        'category' => $row[3] ?? 'General',
                        'serial_number' => $row[4] ?? null,
                        'model' => $row[5] ?? null,
                        'manufacturer' => $row[6] ?? null,
                        'purchase_date' => $this->parseDate($row[7] ?? null),
                        'purchase_price' => $row[8] ?? 0,
                        'location' => $row[9] ?? null,
                        'status' => $row[10] ?? 'available',
                        'condition' => $row[11] ?? 'good',
                        'notes' => $row[12] ?? null,
                    ]);

                    $results['success']++;
                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = "Row {$rowNumber}: " . $e->getMessage();
                    Log::error("Import error at row {$rowNumber}", [
                        'error' => $e->getMessage(),
                        'data' => $row
                    ]);
                }
            }

            DB::commit();

            Log::info('Asset import completed', [
                'success' => $results['success'],
                'failed' => $results['failed']
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Asset import failed', ['error' => $e->getMessage()]);
            throw $e;
        }

        return $results;
    }

    /**
     * Export assets to Excel
     * 
     * @param array $filters
     * @return string File path
     */
    public function exportAssetsToExcel(array $filters = []): string
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $headers = [
            'Code', 'Name', 'Description', 'Category', 'Serial Number',
            'Model', 'Manufacturer', 'Purchase Date', 'Purchase Price',
            'Location', 'Status', 'Condition', 'Notes', 'Created At'
        ];

        $sheet->fromArray($headers, null, 'A1');

        // Style header row
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '4472C4']]
        ];
        $sheet->getStyle('A1:N1')->applyFromArray($headerStyle);

        // Get assets
        $query = Asset::query();
        
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        if (!empty($filters['location'])) {
            $query->where('location', $filters['location']);
        }

        $assets = $query->get();

        // Populate data
        $row = 2;
        foreach ($assets as $asset) {
            $sheet->fromArray([
                $asset->code,
                $asset->name,
                $asset->description,
                $asset->category,
                $asset->serial_number,
                $asset->model,
                $asset->manufacturer,
                $asset->purchase_date?->format('Y-m-d'),
                $asset->purchase_price,
                $asset->location,
                $asset->status,
                $asset->condition,
                $asset->notes,
                $asset->created_at->format('Y-m-d H:i:s')
            ], null, "A{$row}");
            $row++;
        }

        // Auto-size columns
        foreach (range('A', 'N') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Save file
        $fileName = 'assets_export_' . date('YmdHis') . '.xlsx';
        $filePath = storage_path('app/exports/' . $fileName);

        // Ensure directory exists
        if (!file_exists(storage_path('app/exports'))) {
            mkdir(storage_path('app/exports'), 0755, true);
        }

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);

        Log::info('Asset export completed', [
            'file' => $fileName,
            'count' => $assets->count()
        ]);

        return $filePath;
    }

    /**
     * Export assets to CSV
     * 
     * @param array $filters
     * @return string File path
     */
    public function exportAssetsToCSV(array $filters = []): string
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers
        $headers = [
            'Code', 'Name', 'Description', 'Category', 'Serial Number',
            'Model', 'Manufacturer', 'Purchase Date', 'Purchase Price',
            'Location', 'Status', 'Condition', 'Notes'
        ];

        $sheet->fromArray($headers, null, 'A1');

        // Get assets
        $query = Asset::query();
        
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        $assets = $query->get();

        // Populate data
        $row = 2;
        foreach ($assets as $asset) {
            $sheet->fromArray([
                $asset->code,
                $asset->name,
                $asset->description,
                $asset->category,
                $asset->serial_number,
                $asset->model,
                $asset->manufacturer,
                $asset->purchase_date?->format('Y-m-d'),
                $asset->purchase_price,
                $asset->location,
                $asset->status,
                $asset->condition,
                $asset->notes
            ], null, "A{$row}");
            $row++;
        }

        // Save file
        $fileName = 'assets_export_' . date('YmdHis') . '.csv';
        $filePath = storage_path('app/exports/' . $fileName);

        // Ensure directory exists
        if (!file_exists(storage_path('app/exports'))) {
            mkdir(storage_path('app/exports'), 0755, true);
        }

        $writer = new Csv($spreadsheet);
        $writer->save($filePath);

        return $filePath;
    }

    /**
     * Get import template
     * 
     * @return string File path to template
     */
    public function getImportTemplate(): string
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Set headers with instructions
        $headers = [
            'Code*', 'Name*', 'Description', 'Category', 'Serial Number',
            'Model', 'Manufacturer', 'Purchase Date', 'Purchase Price',
            'Location', 'Status', 'Condition', 'Notes'
        ];

        $sheet->fromArray($headers, null, 'A1');

        // Add sample data
        $sampleData = [
            ['AST001', 'Laptop Dell Latitude', 'Core i7, 16GB RAM', 'Computer', 'SN123456', 'Latitude 5420', 'Dell', '2024-01-01', '15000000', 'Office Floor 3', 'available', 'good', 'Primary work laptop'],
            ['AST002', 'Monitor LG 27"', '4K Display', 'Peripheral', 'MON789', 'LG27UK850', 'LG', '2024-01-15', '5000000', 'Office Floor 3', 'available', 'excellent', '']
        ];

        $sheet->fromArray($sampleData, null, 'A2');

        // Style header
        $headerStyle = [
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '4472C4']]
        ];
        $sheet->getStyle('A1:M1')->applyFromArray($headerStyle);

        // Add notes
        $sheet->setCellValue('A15', 'INSTRUCTIONS:');
        $sheet->setCellValue('A16', '* = Required field');
        $sheet->setCellValue('A17', 'Date format: YYYY-MM-DD');
        $sheet->setCellValue('A18', 'Status options: available, in_use, maintenance, retired');
        $sheet->setCellValue('A19', 'Condition options: excellent, good, fair, poor');

        // Auto-size columns
        foreach (range('A', 'M') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // Save template
        $fileName = 'asset_import_template.xlsx';
        $filePath = storage_path('app/templates/' . $fileName);

        // Ensure directory exists
        if (!file_exists(storage_path('app/templates'))) {
            mkdir(storage_path('app/templates'), 0755, true);
        }

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);

        return $filePath;
    }

    /**
     * Parse date from various formats
     * 
     * @param mixed $date
     * @return Carbon|null
     */
    private function parseDate($date): ?Carbon
    {
        if (empty($date)) {
            return null;
        }

        try {
            if (is_numeric($date)) {
                // Excel date serial number
                return Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($date));
            }

            return Carbon::parse($date);
        } catch (\Exception $e) {
            Log::warning('Failed to parse date', ['date' => $date]);
            return null;
        }
    }
}
