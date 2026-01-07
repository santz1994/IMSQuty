<?php

namespace App\Http\Controllers;

use App\Services\TicketAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TicketAssignmentController extends BaseController
{
    protected TicketAssignmentService $assignmentService;

    public function __construct(TicketAssignmentService $assignmentService)
    {
        $this->assignmentService = $assignmentService;
    }

    /**
     * Auto-assign ticket to available technician
     * 
     * @param Request $request
     * @param int $ticketId
     * @return JsonResponse
     */
    public function autoAssign(Request $request, int $ticketId): JsonResponse
    {
        $result = $this->assignmentService->autoAssign($ticketId);
        
        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Manually assign ticket to specific technician
     * 
     * @param Request $request
     * @param int $ticketId
     * @return JsonResponse
     */
    public function manualAssign(Request $request, int $ticketId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'technician_id' => 'required|integer|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->assignmentService->manualAssign(
            $ticketId,
            $request->technician_id,
            auth()->id() ?? 1
        );
        
        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Reassign ticket to another technician
     * 
     * @param Request $request
     * @param int $ticketId
     * @return JsonResponse
     */
    public function reassign(Request $request, int $ticketId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'new_technician_id' => 'required|integer|exists:users,id',
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->assignmentService->reassign(
            $ticketId,
            $request->new_technician_id,
            $request->reason
        );
        
        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Unassign ticket
     * 
     * @param Request $request
     * @param int $ticketId
     * @return JsonResponse
     */
    public function unassign(Request $request, int $ticketId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $result = $this->assignmentService->unassign(
            $ticketId,
            $request->reason
        );
        
        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Get tickets by technician
     * 
     * @param int $technicianId
     * @return JsonResponse
     */
    public function getByTechnician(int $technicianId): JsonResponse
    {
        $result = $this->assignmentService->getByTechnician($technicianId);
        
        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Get assignment statistics
     * 
     * @return JsonResponse
     */
    public function getStatistics(): JsonResponse
    {
        $statistics = $this->assignmentService->getAssignmentStatistics();
        
        return response()->json([
            'success' => true,
            'statistics' => $statistics,
        ]);
    }
}
