<?php

namespace App\Http\Controllers;

use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private ReportService $service) {}

    public function index(Request $request): JsonResponse
    {
        $reports = $this->service->getAll(
            $request->input('per_page', 15),
            $request->only(['type', 'status'])
        );

        return response()->json([
            'success' => true,
            'data' => $reports,
            'message' => 'Reports retrieved successfully'
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $report = $this->service->getById($id);

        if (!$report) {
            return response()->json([
                'success' => false,
                'error' => ['code' => 'NOT_FOUND'],
                'message' => 'Report not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $report,
            'message' => 'Report retrieved successfully'
        ]);
    }

    public function generate(Request $request): JsonResponse
    {
        $report = $this->service->generate($request->all());

        return response()->json([
            'success' => true,
            'data' => $report,
            'message' => 'Report generation initiated'
        ], 201);
    }

    public function schedules(Request $request): JsonResponse
    {
        $schedules = $this->service->getSchedules($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $schedules,
            'message' => 'Schedules retrieved successfully'
        ]);
    }

    public function createSchedule(Request $request): JsonResponse
    {
        $schedule = $this->service->createSchedule($request->all());

        return response()->json([
            'success' => true,
            'data' => $schedule,
            'message' => 'Schedule created successfully'
        ], 201);
    }

    public function processDue(): JsonResponse
    {
        $processed = $this->service->processDueSchedules();

        return response()->json([
            'success' => true,
            'data' => ['processed' => $processed],
            'message' => "{$processed} schedules processed"
        ]);
    }

    public function statistics(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->getStatistics(),
            'message' => 'Statistics retrieved successfully'
        ]);
    }
}
