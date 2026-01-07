<?php

namespace App\Http\Controllers;

use App\Services\EscalationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EscalationController extends BaseController
{
    protected EscalationService $escalationService;

    public function __construct(EscalationService $escalationService)
    {
        $this->escalationService = $escalationService;
    }

    /**
     * Escalate ticket to higher priority
     * 
     * @param Request $request
     * @param int $ticketId
     * @return JsonResponse
     */
    public function escalate(Request $request, int $ticketId): JsonResponse
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

        $result = $this->escalationService->escalate(
            $ticketId,
            $request->reason,
            auth()->id() ?? 1
        );
        
        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Auto-escalate all breached tickets
     * 
     * @return JsonResponse
     */
    public function autoEscalateBreached(): JsonResponse
    {
        $result = $this->escalationService->autoEscalateBreachedTickets();
        
        return response()->json($result);
    }

    /**
     * De-escalate ticket
     * 
     * @param Request $request
     * @param int $ticketId
     * @return JsonResponse
     */
    public function deEscalate(Request $request, int $ticketId): JsonResponse
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

        $result = $this->escalationService->deEscalate(
            $ticketId,
            $request->reason,
            auth()->id() ?? 1
        );
        
        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Get escalation candidates
     * 
     * @return JsonResponse
     */
    public function getCandidates(): JsonResponse
    {
        $result = $this->escalationService->getEscalationCandidates();
        
        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Get escalation statistics
     * 
     * @return JsonResponse
     */
    public function getStatistics(): JsonResponse
    {
        $statistics = $this->escalationService->getEscalationStatistics();
        
        return response()->json([
            'success' => true,
            'statistics' => $statistics,
        ]);
    }
}
