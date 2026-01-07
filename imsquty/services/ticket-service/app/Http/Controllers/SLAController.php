<?php

namespace App\Http\Controllers;

use App\Services\SLAService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SLAController extends BaseController
{
    protected SLAService $slaService;

    public function __construct(SLAService $slaService)
    {
        $this->slaService = $slaService;
    }

    /**
     * Get SLA status for a ticket
     * 
     * @param int $ticketId
     * @return JsonResponse
     */
    public function getTicketSLAStatus(int $ticketId): JsonResponse
    {
        $result = $this->slaService->getTicketSLAStatus($ticketId);
        
        return response()->json($result, $result['success'] ? 200 : 404);
    }

    /**
     * Get overdue tickets (SLA breached)
     * 
     * @return JsonResponse
     */
    public function getOverdueTickets(): JsonResponse
    {
        $tickets = $this->slaService->getOverdueTickets();
        
        return response()->json([
            'success' => true,
            'count' => $tickets->count(),
            'tickets' => $tickets,
        ]);
    }

    /**
     * Get tickets at risk of SLA breach
     * 
     * @return JsonResponse
     */
    public function getAtRiskTickets(): JsonResponse
    {
        $tickets = $this->slaService->getAtRiskTickets();
        
        return response()->json([
            'success' => true,
            'count' => $tickets->count(),
            'tickets' => $tickets,
        ]);
    }

    /**
     * Get SLA statistics
     * 
     * @return JsonResponse
     */
    public function getStatistics(): JsonResponse
    {
        $statistics = $this->slaService->getSLAStatistics();
        
        return response()->json([
            'success' => true,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Check if ticket should be escalated
     * 
     * @param int $ticketId
     * @return JsonResponse
     */
    public function checkEscalation(int $ticketId): JsonResponse
    {
        $result = $this->slaService->shouldEscalate($ticketId);
        
        return response()->json($result, $result['success'] ? 200 : 404);
    }
}
