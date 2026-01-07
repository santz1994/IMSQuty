<?php

namespace App\Services;

use App\Repositories\TicketRepository;
use App\Models\Ticket;
use App\Models\TicketHistory;
use App\Models\User;
use Carbon\Carbon;

class EscalationService
{
    protected TicketRepository $ticketRepository;
    protected SLAService $slaService;

    public function __construct(
        TicketRepository $ticketRepository,
        SLAService $slaService
    ) {
        $this->ticketRepository = $ticketRepository;
        $this->slaService = $slaService;
    }

    /**
     * Escalate ticket to higher priority
     */
    public function escalate(int $ticketId, string $reason, ?int $escalatedBy = null): array
    {
        $ticket = $this->ticketRepository->findById($ticketId);
        
        if (!$ticket) {
            return [
                'success' => false,
                'message' => 'Ticket not found',
            ];
        }

        // Check if already at highest priority
        $currentPriority = $ticket->priority;
        if ($currentPriority && strtolower($currentPriority->name) === 'urgent') {
            return [
                'success' => false,
                'message' => 'Ticket is already at highest priority',
            ];
        }

        // Determine new priority
        $newPriorityId = $this->getNextHigherPriority($ticket->ticket_priority_id);

        if (!$newPriorityId) {
            return [
                'success' => false,
                'message' => 'Unable to determine higher priority level',
            ];
        }

        $oldPriorityId = $ticket->ticket_priority_id;

        // Update ticket priority
        $updated = $this->ticketRepository->update($ticket->id, [
            'ticket_priority_id' => $newPriorityId,
            'escalated' => true,
            'escalated_at' => Carbon::now(),
            'escalation_reason' => $reason,
        ]);

        // Log escalation history
        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'field_changed' => 'ticket_priority_id',
            'old_value' => $oldPriorityId,
            'new_value' => $newPriorityId,
            'changed_by_user_id' => $escalatedBy ?? auth()->id() ?? 1,
            'changed_at' => Carbon::now(),
            'change_type' => 'escalation',
            'event_type' => 'escalate',
            'notes' => $reason,
        ]);

        // If escalation policy specifies reassignment, find manager/supervisor
        $escalateTo = $this->findEscalationTarget($ticket);
        if ($escalateTo) {
            $this->ticketRepository->update($ticket->id, [
                'assigned_to' => $escalateTo->id,
                'assigned_at' => Carbon::now(),
            ]);

            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'field_changed' => 'assigned_to',
                'old_value' => $ticket->assigned_to,
                'new_value' => $escalateTo->id,
                'changed_by_user_id' => $escalatedBy ?? auth()->id() ?? 1,
                'changed_at' => Carbon::now(),
                'change_type' => 'reassignment',
                'event_type' => 'escalation_reassign',
                'notes' => 'Reassigned due to escalation',
            ]);
        }

        return [
            'success' => true,
            'message' => 'Ticket escalated successfully',
            'ticket' => $updated->fresh(['priority', 'status', 'assignedTo']),
            'escalated_to' => $escalateTo,
            'reason' => $reason,
        ];
    }

    /**
     * Auto-escalate tickets based on SLA breach
     */
    public function autoEscalateBreachedTickets(): array
    {
        $overdueTickets = $this->slaService->getOverdueTickets();
        $escalated = [];
        $failed = [];

        foreach ($overdueTickets as $ticket) {
            $result = $this->escalate(
                $ticket->id,
                'Auto-escalated due to SLA breach',
                null // System escalation
            );

            if ($result['success']) {
                $escalated[] = $ticket->id;
            } else {
                $failed[] = [
                    'ticket_id' => $ticket->id,
                    'reason' => $result['message'],
                ];
            }
        }

        return [
            'success' => true,
            'total_checked' => $overdueTickets->count(),
            'escalated_count' => count($escalated),
            'failed_count' => count($failed),
            'escalated_tickets' => $escalated,
            'failed_tickets' => $failed,
        ];
    }

    /**
     * De-escalate ticket (reduce priority)
     */
    public function deEscalate(int $ticketId, string $reason, int $deEscalatedBy): array
    {
        $ticket = $this->ticketRepository->findById($ticketId);
        
        if (!$ticket) {
            return [
                'success' => false,
                'message' => 'Ticket not found',
            ];
        }

        if (!$ticket->escalated) {
            return [
                'success' => false,
                'message' => 'Ticket has not been escalated',
            ];
        }

        // Determine new priority (one level lower)
        $newPriorityId = $this->getNextLowerPriority($ticket->ticket_priority_id);

        if (!$newPriorityId) {
            return [
                'success' => false,
                'message' => 'Unable to determine lower priority level',
            ];
        }

        $oldPriorityId = $ticket->ticket_priority_id;

        // Update ticket
        $updated = $this->ticketRepository->update($ticket->id, [
            'ticket_priority_id' => $newPriorityId,
            'escalated' => false,
            'escalated_at' => null,
            'escalation_reason' => null,
        ]);

        // Log de-escalation history
        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'field_changed' => 'ticket_priority_id',
            'old_value' => $oldPriorityId,
            'new_value' => $newPriorityId,
            'changed_by_user_id' => $deEscalatedBy,
            'changed_at' => Carbon::now(),
            'change_type' => 'de_escalation',
            'event_type' => 'de_escalate',
            'notes' => $reason,
        ]);

        return [
            'success' => true,
            'message' => 'Ticket de-escalated successfully',
            'ticket' => $updated->fresh(['priority', 'status']),
            'reason' => $reason,
        ];
    }

    /**
     * Get escalation candidates (tickets that should be escalated)
     */
    public function getEscalationCandidates(): array
    {
        $atRiskTickets = $this->slaService->getAtRiskTickets();
        $breachedTickets = $this->slaService->getOverdueTickets();

        $candidates = [];

        foreach ($atRiskTickets as $ticket) {
            $candidates[] = [
                'ticket' => $ticket,
                'reason' => 'SLA at risk',
                'urgency' => 'medium',
            ];
        }

        foreach ($breachedTickets as $ticket) {
            $candidates[] = [
                'ticket' => $ticket,
                'reason' => 'SLA breached',
                'urgency' => 'high',
            ];
        }

        return [
            'total_candidates' => count($candidates),
            'candidates' => $candidates,
        ];
    }

    /**
     * Get next higher priority ID
     */
    protected function getNextHigherPriority(int $currentPriorityId): ?int
    {
        // Priority hierarchy: Low (4) → Normal (3) → High (2) → Urgent (1)
        $priorityMap = [
            4 => 3, // Low → Normal
            3 => 2, // Normal → High
            2 => 1, // High → Urgent
            1 => 1, // Urgent → Urgent (already highest)
        ];

        return $priorityMap[$currentPriorityId] ?? null;
    }

    /**
     * Get next lower priority ID
     */
    protected function getNextLowerPriority(int $currentPriorityId): ?int
    {
        // Priority hierarchy: Urgent (1) → High (2) → Normal (3) → Low (4)
        $priorityMap = [
            1 => 2, // Urgent → High
            2 => 3, // High → Normal
            3 => 4, // Normal → Low
            4 => 4, // Low → Low (already lowest)
        ];

        return $priorityMap[$currentPriorityId] ?? null;
    }

    /**
     * Find escalation target (manager/supervisor)
     */
    protected function findEscalationTarget(Ticket $ticket): ?User
    {
        // Find managers or supervisors (assuming role_id 2 is manager)
        return User::where('status', 'active')
            ->whereHas('roles', function($query) {
                $query->whereIn('name', ['manager', 'supervisor']);
            })
            ->first();
    }

    /**
     * Get escalation statistics
     */
    public function getEscalationStatistics(): array
    {
        $totalEscalated = Ticket::where('escalated', true)->count();
        $autoEscalated = TicketHistory::where('event_type', 'escalate')
            ->whereNull('changed_by_user_id')
            ->count();
        $manualEscalated = $totalEscalated - $autoEscalated;

        $byPriority = Ticket::where('escalated', true)
            ->with('priority')
            ->get()
            ->groupBy('priority.name')
            ->map(fn($group) => $group->count())
            ->toArray();

        return [
            'total_escalated' => $totalEscalated,
            'auto_escalated' => $autoEscalated,
            'manual_escalated' => $manualEscalated,
            'by_priority' => $byPriority,
        ];
    }
}
