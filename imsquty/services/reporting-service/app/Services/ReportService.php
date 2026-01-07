<?php

namespace App\Services;

use App\Repositories\ReportRepository;
use App\Services\ServiceIntegrationClient;
use App\Services\PdfExportService;
use App\Services\ExcelExportService;
use App\Services\CsvExportService;
use App\Models\Report;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ReportService
{
    public function __construct(
        private ReportRepository $repository,
        private ServiceIntegrationClient $serviceClient,
        private PdfExportService $pdfExport,
        private ExcelExportService $excelExport,
        private CsvExportService $csvExport
    ) {}

    public function getAll(int $perPage = 15, array $filters = [])
    {
        return $this->repository->getAll($perPage, $filters);
    }

    public function getById(int $id)
    {
        return $this->repository->findById($id);
    }

    public function generate(array $data)
    {
        // Create report record
        $report = $this->repository->create(array_merge($data, [
            'status' => Report::STATUS_PENDING,
            'created_by' => auth()->id() ?? 1
        ]));

        // Process report immediately (in production, queue this)
        $this->processReport($report->id);

        return $report->fresh();
    }

    public function processReport(int $id): bool
    {
        $report = $this->getById($id);
        if (!$report) return false;

        // Update status to processing
        $this->repository->update($id, [
            'status' => Report::STATUS_PROCESSING
        ]);

        try {
            // Generate report data from services
            $resultData = $this->generateReportData($report->type, $report->parameters);

            // Export to requested format
            $filePath = $this->exportReport($report->type, $report->format, $resultData);

            // Update as completed
            $this->repository->update($id, [
                'status' => Report::STATUS_COMPLETED,
                'result_data' => $resultData,
                'file_path' => $filePath,
                'generated_at' => now(),
                'updated_by' => auth()->id() ?? 1
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error("Report generation failed for ID {$id}: " . $e->getMessage());
            
            $this->repository->update($id, [
                'status' => Report::STATUS_FAILED,
                'result_data' => ['error' => $e->getMessage()]
            ]);
            
            return false;
        }
    }

    private function generateReportData(string $type, array $parameters): array
    {
        return match($type) {
            Report::TYPE_ASSET => $this->generateAssetReport($parameters),
            Report::TYPE_TICKET => $this->generateTicketReport($parameters),
            Report::TYPE_FINANCIAL => $this->generateFinancialReport($parameters),
            Report::TYPE_INVENTORY => $this->generateInventoryReport($parameters),
            Report::TYPE_USER => $this->generateUserReport($parameters),
            Report::TYPE_CUSTOM => $this->generateCustomReport($parameters),
            default => []
        };
    }

    private function generateAssetReport(array $parameters): array
    {
        $data = $this->serviceClient->getAssetData($parameters);
        
        return [
            'title' => 'Asset Management Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'parameters' => $parameters,
            'summary' => [
                'total_assets' => $data['total_assets'],
                'active_assets' => $data['active_assets'],
                'inactive_assets' => $data['inactive_assets'],
                'maintenance_due' => $data['maintenance_due'],
                'warranty_expiring' => $data['warranty_expiring']
            ],
            'assets' => $data['assets'],
            'breakdown' => [
                'by_category' => $data['by_category'],
                'by_location' => $data['by_location'],
                'by_status' => $data['by_status']
            ]
        ];
    }

    private function generateTicketReport(array $parameters): array
    {
        $data = $this->serviceClient->getTicketData($parameters);
        
        return [
            'title' => 'Ticket Management Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'parameters' => $parameters,
            'summary' => [
                'total_tickets' => $data['total_tickets'],
                'open_tickets' => $data['open_tickets'],
                'in_progress_tickets' => $data['in_progress_tickets'],
                'resolved_tickets' => $data['resolved_tickets'],
                'avg_resolution_time' => round($data['avg_resolution_time'], 2) . ' hours'
            ],
            'tickets' => $data['tickets'],
            'breakdown' => [
                'by_priority' => $data['by_priority'],
                'by_status' => $data['by_status'],
                'by_category' => $data['by_category']
            ]
        ];
    }

    private function generateFinancialReport(array $parameters): array
    {
        $data = $this->serviceClient->getFinancialData($parameters);
        
        return [
            'title' => 'Financial Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'parameters' => $parameters,
            'summary' => [
                'total_invoices' => $data['total_invoices'],
                'pending_invoices' => $data['pending_invoices'],
                'paid_invoices' => $data['paid_invoices'],
                'overdue_invoices' => $data['overdue_invoices'],
                'total_amount' => 'Rp ' . number_format($data['total_amount'], 0, ',', '.'),
                'paid_amount' => 'Rp ' . number_format($data['paid_amount'], 0, ',', '.'),
                'pending_amount' => 'Rp ' . number_format($data['pending_amount'], 0, ',', '.'),
                'total_budget' => 'Rp ' . number_format($data['total_budget'], 0, ',', '.'),
                'total_spent' => 'Rp ' . number_format($data['total_spent'], 0, ',', '.')
            ],
            'invoices' => $data['invoices'],
            'budgets' => $data['budgets'],
            'expenses' => $data['expenses']
        ];
    }

    private function generateInventoryReport(array $parameters): array
    {
        $data = $this->serviceClient->getInventoryData($parameters);
        
        return [
            'title' => 'Inventory Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'parameters' => $parameters,
            'summary' => [
                'total_items' => $data['total_items'],
                'low_stock_items' => $data['low_stock_items'],
                'out_of_stock' => $data['out_of_stock'],
                'total_value' => 'Rp ' . number_format($data['total_value'], 0, ',', '.')
            ],
            'items' => $data['items'],
            'breakdown' => [
                'by_category' => $data['by_category'],
                'by_location' => $data['by_location']
            ]
        ];
    }

    private function generateUserReport(array $parameters): array
    {
        $data = $this->serviceClient->getUserData($parameters);
        
        return [
            'title' => 'User Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'parameters' => $parameters,
            'summary' => [
                'total_users' => $data['total_users'],
                'active_users' => $data['active_users'],
                'inactive_users' => $data['inactive_users']
            ],
            'users' => $data['users'],
            'breakdown' => [
                'by_role' => $data['by_role'],
                'by_department' => $data['by_department']
            ]
        ];
    }

    private function generateCustomReport(array $parameters): array
    {
        // Custom report logic based on parameters
        return [
            'title' => 'Custom Report',
            'generated_at' => now()->format('Y-m-d H:i:s'),
            'parameters' => $parameters,
            'data' => []
        ];
    }

    private function exportReport(string $type, string $format, array $data): string
    {
        return match($format) {
            Report::FORMAT_PDF => $this->exportToPdf($type, $data),
            Report::FORMAT_EXCEL => $this->exportToExcel($type, $data),
            Report::FORMAT_CSV => $this->exportToCsv($type, $data),
            Report::FORMAT_JSON => $this->exportToJson($data),
            default => $this->exportToJson($data)
        };
    }

    private function exportToPdf(string $type, array $data): string
    {
        return match($type) {
            Report::TYPE_ASSET => $this->pdfExport->generateAssetReport($data),
            Report::TYPE_TICKET => $this->pdfExport->generateTicketReport($data),
            Report::TYPE_FINANCIAL => $this->pdfExport->generateFinancialReport($data),
            Report::TYPE_INVENTORY => $this->pdfExport->generateInventoryReport($data),
            Report::TYPE_USER => $this->pdfExport->generateUserReport($data),
            default => $this->exportToJson($data)
        };
    }

    private function exportToExcel(string $type, array $data): string
    {
        return match($type) {
            Report::TYPE_ASSET => $this->excelExport->generateAssetReport($data),
            Report::TYPE_TICKET => $this->excelExport->generateTicketReport($data),
            Report::TYPE_FINANCIAL => $this->excelExport->generateFinancialReport($data),
            Report::TYPE_INVENTORY => $this->excelExport->generateInventoryReport($data),
            Report::TYPE_USER => $this->excelExport->generateUserReport($data),
            default => $this->exportToJson($data)
        };
    }

    private function exportToCsv(string $type, array $data): string
    {
        return match($type) {
            Report::TYPE_ASSET => $this->csvExport->generateAssetReport($data),
            Report::TYPE_TICKET => $this->csvExport->generateTicketReport($data),
            Report::TYPE_FINANCIAL => $this->csvExport->generateFinancialReport($data),
            Report::TYPE_INVENTORY => $this->csvExport->generateInventoryReport($data),
            Report::TYPE_USER => $this->csvExport->generateUserReport($data),
            default => $this->exportToJson($data)
        };
    }

    private function exportToJson(array $data): string
    {
        $filename = 'report_' . date('YmdHis') . '.json';
        $path = "reports/json/{$filename}";
        
        Storage::put($path, json_encode($data, JSON_PRETTY_PRINT));
        
        return $path;
    }

    public function downloadReport(int $id): ?string
    {
        $report = $this->getById($id);
        
        if (!$report || !$report->file_path || $report->status !== Report::STATUS_COMPLETED) {
            return null;
        }

        return Storage::path($report->file_path);
    }

    public function getSchedules(int $perPage = 15)
    {
        return $this->repository->getAllSchedules($perPage);
    }

    public function createSchedule(array $data)
    {
        // Calculate first run time
        $nextRun = $this->calculateNextRunTime($data['frequency']);
        
        return $this->repository->createSchedule(array_merge($data, [
            'next_run_at' => $nextRun,
            'is_active' => $data['is_active'] ?? true,
            'created_by' => auth()->id() ?? 1
        ]));
    }

    public function updateSchedule(int $id, array $data): bool
    {
        $schedule = $this->repository->findById($id);
        if (!$schedule) return false;

        // Recalculate next run if frequency changed
        if (isset($data['frequency']) && $data['frequency'] !== $schedule->frequency) {
            $data['next_run_at'] = $this->calculateNextRunTime($data['frequency']);
        }

        $data['updated_by'] = auth()->id() ?? 1;
        
        return $this->repository->update($id, $data);
    }

    public function deleteSchedule(int $id): bool
    {
        return $this->repository->delete($id);
    }

    public function processDueSchedules(): int
    {
        $schedules = $this->repository->getDueSchedules();
        $processed = 0;

        foreach ($schedules as $schedule) {
            try {
                $report = $this->generate([
                    'name' => $schedule->name . ' - ' . now()->format('Y-m-d'),
                    'type' => $schedule->report_type,
                    'parameters' => $schedule->parameters,
                    'format' => $schedule->format
                ]);

                // TODO: Send report to recipients via email
                // NotificationService::sendReportEmail($schedule->recipients, $report);

                $processed++;

                // Update next run time
                $this->repository->updateScheduleNextRun($schedule->id);
                
                Log::info("Processed scheduled report: {$schedule->name}");
            } catch (\Exception $e) {
                Log::error("Failed to process schedule {$schedule->id}: " . $e->getMessage());
            }
        }

        return $processed;
    }

    private function calculateNextRunTime(string $frequency): \Carbon\Carbon
    {
        return match($frequency) {
            'Daily' => now()->addDay(),
            'Weekly' => now()->addWeek(),
            'Monthly' => now()->addMonth(),
            'Quarterly' => now()->addMonths(3),
            'Yearly' => now()->addYear(),
            default => now()->addDay()
        };
    }

    public function getStatistics(): array
    {
        return $this->repository->getStatistics();
    }
}
