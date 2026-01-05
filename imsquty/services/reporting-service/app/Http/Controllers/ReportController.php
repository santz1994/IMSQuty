<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

class ReportController extends Controller
{
    use ApiResponses;

    public function __construct(private ReportService $service) {}

    public function index(Request $request): JsonResponse
    {
        $reports = $this->service->getAll(
            $request->input('per_page', 15),
            $request->only(['type', 'status'])
        );

        return $this->successResponse($reports, 'Reports retrieved successfully');
    }

    public function show(int $id): JsonResponse
    {
        $report = $this->service->getById($id);

        if (!$report) {
            return $this->notFoundResponse('Report not found');
        }

        return $this->successResponse($report, 'Report retrieved successfully');
    }

    public function generate(Request $request): JsonResponse
    {
        $report = $this->service->generate($request->all());

        return $this->createdResponse($report, 'Report generation initiated');
    }

    public function schedules(Request $request): JsonResponse
    {
        $schedules = $this->service->getSchedules($request->input('per_page', 15));

        return $this->successResponse($schedules, 'Schedules retrieved successfully');
    }

    public function createSchedule(Request $request): JsonResponse
    {
        $schedule = $this->service->createSchedule($request->all());

        return $this->createdResponse($schedule, 'Schedule created successfully');
    }

    public function processDue(): JsonResponse
    {
        $processed = $this->service->processDueSchedules();

        return $this->successResponse(['processed' => $processed], "{$processed} schedules processed");
    }

    public function statistics(): JsonResponse
    {
        return $this->successResponse($this->service->getStatistics(), 'Statistics retrieved successfully');
    }
}
