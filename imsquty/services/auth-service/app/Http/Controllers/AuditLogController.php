<?php

namespace App\Http\Controllers;

use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AuditLogController extends Controller
{
    protected AuditLogService $auditLogService;

    public function __construct(AuditLogService $auditLogService)
    {
        $this->auditLogService = $auditLogService;
    }

    /**
     * Get paginated audit logs with filters
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|integer|exists:users,id',
            'action' => 'nullable|string',
            'resource' => 'nullable|string',
            'ip_address' => 'nullable|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'search' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $logs = $this->auditLogService->getAuditLogs($request->all());

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    /**
     * Get a single audit log by ID
     *
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $log = $this->auditLogService->getAuditLogById($id);

        if (!$log) {
            return response()->json([
                'success' => false,
                'message' => 'Audit log not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $log,
        ]);
    }

    /**
     * Get audit log statistics
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function statistics(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $statistics = $this->auditLogService->getAuditStatistics($request->all());

        return response()->json([
            'success' => true,
            'data' => $statistics,
        ]);
    }

    /**
     * Export audit logs to CSV
     *
     * @param Request $request
     * @return BinaryFileResponse|JsonResponse
     */
    public function exportCSV(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'nullable|integer|exists:users,id',
            'action' => 'nullable|string',
            'resource' => 'nullable|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $filePath = $this->auditLogService->exportToCSV($request->all());

            return response()->download($filePath)->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Export failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available actions for filtering
     *
     * @return JsonResponse
     */
    public function getActions(): JsonResponse
    {
        $actions = $this->auditLogService->getAvailableActions();

        return response()->json([
            'success' => true,
            'data' => $actions,
        ]);
    }

    /**
     * Get user activity summary
     *
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     */
    public function userActivity(Request $request, int $userId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $summary = $this->auditLogService->getUserActivitySummary($userId, $request->all());

        return response()->json([
            'success' => true,
            'data' => $summary,
        ]);
    }

    /**
     * Clean up old audit logs (admin only)
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function cleanup(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'days_to_keep' => 'required|integer|min:30|max:365',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $deletedCount = $this->auditLogService->cleanupOldLogs($request->days_to_keep);

        return response()->json([
            'success' => true,
            'message' => "Successfully deleted {$deletedCount} old audit logs",
            'deleted_count' => $deletedCount,
        ]);
    }
}
