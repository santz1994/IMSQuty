<?php

namespace App\Services;

use App\Repositories\TicketRepository;
use App\Models\Ticket;
use App\Models\SLAPolicy;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class SLAService
{
    protected TicketRepository $ticketRepository;

    public function __construct(TicketRepository $ticketRepository)
    {
        $this->ticketRepository = $ticketRepository;
    }

    /**
     * Get SLA status for a ticket
     */
    public function getTicketSLAStatus(int $ticketId): array
    {
        $ticket = $this->ticketRepository->findById($ticketId);
        
        if (!$ticket) {
            return [
                'success' => false,
                'message' => 'Ticket not found',
            ];
        }

        $slaPolicy = $this->getSLAPolicyForTicket($ticket);
        
        if (!$slaPolicy) {
            return [
                'success' => true,
                'ticket_id' => $ticketId,
                'sla_status' => 'No SLA Policy',
                'has_sla' => false,
            ];
        }

        $createdAt = Carbon::parse($ticket->created_at);
        $now = Carbon::now();
        
        // Calculate response time status (first_response_hours converted to minutes)
        $responseTime = $slaPolicy->first_response_hours * 60; // in minutes
        $responseDeadline = $createdAt->copy()->addMinutes($responseTime);
        $responseElapsed = $createdAt->diffInMinutes($now);
        $responseRemaining = $responseDeadline->diffInMinutes($now, false);
        
        // Calculate resolution time status (resolution_hours converted to minutes)
        $resolutionTime = $slaPolicy->resolution_hours * 60; // in minutes
        $resolutionDeadline = $createdAt->copy()->addMinutes($resolutionTime);
        $resolutionElapsed = $createdAt->diffInMinutes($now);
        $resolutionRemaining = $resolutionDeadline->diffInMinutes($now, false);
        
        // Determine status
        $responseStatus = $this->calculateSLAStatus($responseElapsed, $responseTime);
        $resolutionStatus = $this->calculateSLAStatus($resolutionElapsed, $resolutionTime);
        
        // Overall SLA status
        $overallStatus = 'Met';
        if ($ticket->status?->name !== 'Closed' && $ticket->status?->name !== 'Resolved') {
            if ($resolutionRemaining < 0) {
                $overallStatus = 'Breached';
            } elseif ($resolutionRemaining <= ($resolutionTime * 0.2)) {
                $overallStatus = 'At Risk';
            }
        }

        return [
            'success' => true,
            'ticket_id' => $ticketId,
            'sla_policy' => [
                'id' => $slaPolicy->id,
                'name' => $slaPolicy->name,
                'response_time_hours' => $slaPolicy->first_response_hours,
                'resolution_time_hours' => $slaPolicy->resolution_hours,
            ],
            'response' => [
                'status' => $responseStatus,
                'deadline' => $responseDeadline->toISOString(),
                'elapsed_minutes' => $responseElapsed,
                'remaining_minutes' => max(0, $responseRemaining),
                'is_breached' => $responseRemaining < 0,
            ],
            'resolution' => [
                'status' => $resolutionStatus,
                'deadline' => $resolutionDeadline->toISOString(),
                'elapsed_minutes' => $resolutionElapsed,
                'remaining_minutes' => max(0, $resolutionRemaining),
                'is_breached' => $resolutionRemaining < 0,
            ],
            'overall_status' => $overallStatus,
            'ticket_status' => $ticket->status?->name,
            'created_at' => $createdAt->toISOString(),
        ];
    }

    /**
     * Get tickets by SLA status
     */
    public function getTicketsBySLAStatus(string $status): Collection
    {
        $tickets = Ticket::with(['priority', 'status', 'assignedTo'])
            ->whereNotIn('ticket_status_id', function($query) {
                $query->select('id')
                    ->from('ticket_statuses')
                    ->whereIn('name', ['Closed', 'Resolved']);
            })
            ->get();

        return $tickets->filter(function($ticket) use ($status) {
            $slaStatus = $this->getTicketSLAStatus($ticket->id);
            return isset($slaStatus['overall_status']) && 
                   strtolower($slaStatus['overall_status']) === strtolower($status);
        });
    }

    /**
     * Get overdue tickets (SLA breached)
     */
    public function getOverdueTickets(): Collection
    {
        return $this->getTicketsBySLAStatus('Breached');
    }

    /**
     * Get tickets at risk of SLA breach
     */
    public function getAtRiskTickets(): Collection
    {
        return $this->getTicketsBySLAStatus('At Risk');
    }

    /**
     * Get SLA statistics
     */
    public function getSLAStatistics(): array
    {
        $allTickets = Ticket::whereNotIn('ticket_status_id', function($query) {
            $query->select('id')
                ->from('ticket_statuses')
                ->whereIn('name', ['Closed', 'Resolved']);
        })->get();

        $met = 0;
        $atRisk = 0;
        $breached = 0;

        foreach ($allTickets as $ticket) {
            $slaStatus = $this->getTicketSLAStatus($ticket->id);
            if (isset($slaStatus['overall_status'])) {
                switch ($slaStatus['overall_status']) {
                    case 'Met':
                        $met++;
                        break;
                    case 'At Risk':
                        $atRisk++;
                        break;
                    case 'Breached':
                        $breached++;
                        break;
                }
            }
        }

        $total = $allTickets->count();
        $complianceRate = $total > 0 ? (($met / $total) * 100) : 0;

        return [
            'total_active_tickets' => $total,
            'sla_met' => $met,
            'sla_at_risk' => $atRisk,
            'sla_breached' => $breached,
            'compliance_rate' => round($complianceRate, 2),
        ];
    }

    /**
     * Get SLA policy for ticket based on priority
     */
    protected function getSLAPolicyForTicket(Ticket $ticket): ?SLAPolicy
    {
        if (!$ticket->ticket_priority_id) {
            return null;
        }

        return SLAPolicy::where('ticket_priority_id', $ticket->ticket_priority_id)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Calculate SLA status based on elapsed and total time
     */
    protected function calculateSLAStatus(int $elapsed, int $total): string
    {
        if ($elapsed > $total) {
            return 'Breached';
        } elseif ($elapsed >= ($total * 0.8)) {
            return 'At Risk';
        } elseif ($elapsed >= ($total * 0.5)) {
            return 'On Track';
        } else {
            return 'Met';
        }
    }

    /**
     * Check if ticket should be escalated
     */
    public function shouldEscalate(int $ticketId): array
    {
        $slaStatus = $this->getTicketSLAStatus($ticketId);
        
        if (!$slaStatus['success']) {
            return $slaStatus;
        }

        $shouldEscalate = false;
        $reason = '';

        if (isset($slaStatus['overall_status'])) {
            if ($slaStatus['overall_status'] === 'Breached') {
                $shouldEscalate = true;
                $reason = 'SLA breached - immediate escalation required';
            } elseif ($slaStatus['overall_status'] === 'At Risk') {
                $shouldEscalate = true;
                $reason = 'SLA at risk - preventive escalation recommended';
            }
        }

        return [
            'success' => true,
            'ticket_id' => $ticketId,
            'should_escalate' => $shouldEscalate,
            'reason' => $reason,
            'sla_status' => $slaStatus,
        ];
    }
}
