<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use App\Http\Requests\GenerateReportRequest;
use App\Http\Requests\CreateScheduleRequest;
use App\Http\Resources\ReportResource;
use App\Http\Resources\ReportScheduleResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Shared\Traits\ApiResponses;

class ReportController extends Controller
{
    use ApiResponses;

    public function __construct(private ReportService $service) {}

    /**
     * List all reports with filters
     */
    public function index(Request $request): JsonResponse
    {
        $reports = $this->service->getAll(
            $request->input('per_page', 15),
            $request->only(['type', 'status'])
        );

        return $this->paginatedResponse(
            ReportResource::collection($reports->items()),
            $reports,
            'Reports retrieved successfully'
        );
    }

    /**
     * Show single report
     */
    public function show(int $id): JsonResponse
    {
        $report = $this->service->getById($id);

        if (!$report) {
            return $this->notFoundResponse('Report not found');
        }

        return $this->successResponse(
            new ReportResource($report),
            'Report retrieved successfully'
        );
    }

    /**
     * Generate new report
     */
    public function generate(GenerateReportRequest $request): JsonResponse
    {
        $report = $this->service->generate($request->validated());

        return $this->createdResponse(
            new ReportResource($report),
            'Report generation initiated'
        );
    }

    /**
     * Download report file
     */
    public function download(int $id): Response|JsonResponse
    {
        $filePath = $this->service->downloadReport($id);

        if (!$filePath || !file_exists($filePath)) {
            return $this->notFoundResponse('Report file not found');
        }

        return response()->download($filePath);
    }

    /**
     * Delete report
     */
    public function destroy(int $id): JsonResponse
    {
        $report = $this->service->getById($id);

        if (!$report) {
            return $this->notFoundResponse('Report not found');
        }

        $this->service->deleteReport($id);

        return $this->deletedResponse('Report deleted successfully');
    }

    /**
     * List all schedules
     */
    public function schedules(Request $request): JsonResponse
    {
        $schedules = $this->service->getSchedules($request->input('per_page', 15));

        return $this->paginatedResponse(
            ReportScheduleResource::collection($schedules->items()),
            $schedules,
            'Schedules retrieved successfully'
        );
    }

    /**
     * Show single schedule
     */
    public function showSchedule(int $id): JsonResponse
    {
        $schedule = $this->service->getScheduleById($id);

        if (!$schedule) {
            return $this->notFoundResponse('Schedule not found');
        }

        return $this->successResponse(
            new ReportScheduleResource($schedule),
            'Schedule retrieved successfully'
        );
    }

    /**
     * Create schedule
     */
    public function createSchedule(CreateScheduleRequest $request): JsonResponse
    {
        $schedule = $this->service->createSchedule($request->validated());

        return $this->createdResponse(
            new ReportScheduleResource($schedule),
            'Schedule created successfully'
        );
    }

    /**
     * Update schedule
     */
    public function updateSchedule(Request $request, int $id): JsonResponse
    {
        $success = $this->service->updateSchedule($id, $request->all());

        if (!$success) {
            return $this->notFoundResponse('Schedule not found');
        }

        $schedule = $this->service->getScheduleById($id);

        return $this->successResponse(
            new ReportScheduleResource($schedule),
            'Schedule updated successfully'
        );
    }

    /**
     * Delete schedule
     */
    public function destroySchedule(int $id): JsonResponse
    {
        $schedule = $this->service->getScheduleById($id);

        if (!$schedule) {
            return $this->notFoundResponse('Schedule not found');
        }

        $this->service->deleteSchedule($id);

        return $this->deletedResponse('Schedule deleted successfully');
    }

    /**
     * Process due schedules (called by cron)
     */
    public function processDue(): JsonResponse
    {
        $processed = $this->service->processDueSchedules();

        return $this->successResponse(
            ['processed' => $processed],
            "{$processed} schedules processed"
        );
    }

    /**
     * Get reporting statistics
     */
    public function statistics(): JsonResponse
    {
        return $this->successResponse(
            $this->service->getStatistics(),
            'Statistics retrieved successfully'
        );
    }

    /**
     * Get available report types
     */
    public function reportTypes(): JsonResponse
    {
        return $this->successResponse([
            'types' => [
                ['value' => 'Asset', 'label' => 'Asset Management Report'],
                ['value' => 'Ticket', 'label' => 'Ticket Management Report'],
                ['value' => 'Financial', 'label' => 'Financial Report'],
                ['value' => 'Inventory', 'label' => 'Inventory Report'],
                ['value' => 'User', 'label' => 'User Report'],
                ['value' => 'Custom', 'label' => 'Custom Report']
            ],
            'formats' => [
                ['value' => 'PDF', 'label' => 'PDF Document'],
                ['value' => 'Excel', 'label' => 'Excel Spreadsheet'],
                ['value' => 'CSV', 'label' => 'CSV File'],
                ['value' => 'JSON', 'label' => 'JSON Data']
            ],
            'frequencies' => [
                ['value' => 'Daily', 'label' => 'Daily'],
                ['value' => 'Weekly', 'label' => 'Weekly'],
                ['value' => 'Monthly', 'label' => 'Monthly'],
                ['value' => 'Quarterly', 'label' => 'Quarterly'],
                ['value' => 'Yearly', 'label' => 'Yearly']
            ]
        ], 'Report types retrieved successfully');
    }
}
