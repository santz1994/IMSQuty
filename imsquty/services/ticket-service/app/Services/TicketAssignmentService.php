<?php

namespace App\Services;

use App\Repositories\TicketRepository;
use App\Models\Ticket;
use App\Models\User;
use App\Models\TicketHistory;
use Carbon\Carbon;

class TicketAssignmentService
{
    protected TicketRepository $ticketRepository;

    public function __construct(TicketRepository $ticketRepository)
    {
        $this->ticketRepository = $ticketRepository;
    }

    /**
     * Auto-assign ticket to available technician
     */
    public function autoAssign(int $ticketId): array
    {
        $ticket = $this->ticketRepository->findById($ticketId);
        
        if (!$ticket) {
            return [
                'success' => false,
                'message' => 'Ticket not found',
            ];
        }

        if ($ticket->assigned_to) {
            return [
                'success' => false,
                'message' => 'Ticket already assigned',
            ];
        }

        // Find best available technician
        $technician = $this->findBestTechnician($ticket);

        if (!$technician) {
            return [
                'success' => false,
                'message' => 'No available technician found',
            ];
        }

        // Assign ticket
        $updated = $this->ticketRepository->update($ticket->id, [
            'assigned_to' => $technician->id,
            'assigned_at' => Carbon::now(),
        ]);

        // Log assignment history
        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'field_changed' => 'assigned_to',
            'old_value' => null,
            'new_value' => $technician->id,
            'changed_by_user_id' => auth()->id() ?? 1,
            'changed_at' => Carbon::now(),
            'change_type' => 'assignment',
            'event_type' => 'auto_assign',
        ]);

        return [
            'success' => true,
            'message' => 'Ticket auto-assigned successfully',
            'ticket' => $updated,
            'assigned_to' => $technician,
        ];
    }

    /**
     * Manually assign ticket to specific technician
     */
    public function manualAssign(int $ticketId, int $technicianId, int $assignedBy): array
    {
        $ticket = $this->ticketRepository->findById($ticketId);
        
        if (!$ticket) {
            return [
                'success' => false,
                'message' => 'Ticket not found',
            ];
        }

        $technician = User::find($technicianId);
        
        if (!$technician) {
            return [
                'success' => false,
                'message' => 'Technician not found',
            ];
        }

        $oldAssignee = $ticket->assigned_to;

        // Assign ticket
        $updated = $this->ticketRepository->update($ticket->id, [
            'assigned_to' => $technicianId,
            'assigned_at' => Carbon::now(),
        ]);

        // Log assignment history
        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'field_changed' => 'assigned_to',
            'old_value' => $oldAssignee,
            'new_value' => $technicianId,
            'changed_by_user_id' => $assignedBy,
            'changed_at' => Carbon::now(),
            'change_type' => 'assignment',
            'event_type' => 'manual_assign',
        ]);

        return [
            'success' => true,
            'message' => 'Ticket assigned successfully',
            'ticket' => $updated,
            'assigned_to' => $technician,
        ];
    }

    /**
     * Reassign ticket to another technician
     */
    public function reassign(int $ticketId, int $newTechnicianId, string $reason): array
    {
        $ticket = $this->ticketRepository->findById($ticketId);
        
        if (!$ticket) {
            return [
                'success' => false,
                'message' => 'Ticket not found',
            ];
        }

        if (!$ticket->assigned_to) {
            return [
                'success' => false,
                'message' => 'Ticket is not currently assigned',
            ];
        }

        $newTechnician = User::find($newTechnicianId);
        
        if (!$newTechnician) {
            return [
                'success' => false,
                'message' => 'New technician not found',
            ];
        }

        $oldAssignee = $ticket->assigned_to;

        // Reassign ticket
        $updated = $this->ticketRepository->update($ticket->id, [
            'assigned_to' => $newTechnicianId,
            'assigned_at' => Carbon::now(),
        ]);

        // Log reassignment history
        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'field_changed' => 'assigned_to',
            'old_value' => $oldAssignee,
            'new_value' => $newTechnicianId,
            'changed_by_user_id' => auth()->id() ?? 1,
            'changed_at' => Carbon::now(),
            'change_type' => 'reassignment',
            'event_type' => 'reassign',
            'notes' => $reason,
        ]);

        return [
            'success' => true,
            'message' => 'Ticket reassigned successfully',
            'ticket' => $updated,
            'old_assignee' => User::find($oldAssignee),
            'new_assignee' => $newTechnician,
            'reason' => $reason,
        ];
    }

    /**
     * Unassign ticket
     */
    public function unassign(int $ticketId, string $reason): array
    {
        $ticket = $this->ticketRepository->findById($ticketId);
        
        if (!$ticket) {
            return [
                'success' => false,
                'message' => 'Ticket not found',
            ];
        }

        if (!$ticket->assigned_to) {
            return [
                'success' => false,
                'message' => 'Ticket is not currently assigned',
            ];
        }

        $oldAssignee = $ticket->assigned_to;

        // Unassign ticket
        $updated = $this->ticketRepository->update($ticket->id, [
            'assigned_to' => null,
            'assigned_at' => null,
        ]);

        // Log unassignment history
        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'field_changed' => 'assigned_to',
            'old_value' => $oldAssignee,
            'new_value' => null,
            'changed_by_user_id' => auth()->id() ?? 1,
            'changed_at' => Carbon::now(),
            'change_type' => 'unassignment',
            'event_type' => 'unassign',
            'notes' => $reason,
        ]);

        return [
            'success' => true,
            'message' => 'Ticket unassigned successfully',
            'ticket' => $updated,
            'reason' => $reason,
        ];
    }

    /**
     * Get tickets assigned to specific technician
     */
    public function getByTechnician(int $technicianId): array
    {
        $tickets = Ticket::where('assigned_to', $technicianId)
            ->with(['status', 'priority', 'type', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = [
            'total' => $tickets->count(),
            'open' => $tickets->whereNotIn('status.name', ['Closed', 'Resolved'])->count(),
            'high_priority' => $tickets->where('priority.name', 'High')->count(),
        ];

        return [
            'technician_id' => $technicianId,
            'tickets' => $tickets,
            'statistics' => $stats,
        ];
    }

    /**
     * Find best available technician using round-robin and workload balancing
     */
    protected function findBestTechnician(Ticket $ticket): ?User
    {
        // Get all active technicians (assuming role_id 3 is technician)
        $technicians = User::where('status', 'active')
            ->whereHas('roles', function($query) {
                $query->where('name', 'technician');
            })
            ->get();

        if ($technicians->isEmpty()) {
            return null;
        }

        // Calculate workload for each technician
        $workloads = [];
        foreach ($technicians as $technician) {
            $activeTickets = Ticket::where('assigned_to', $technician->id)
                ->whereNotIn('ticket_status_id', function($query) {
                    $query->select('id')
                        ->from('ticket_statuses')
                        ->whereIn('name', ['Closed', 'Resolved']);
                })
                ->count();
            
            $workloads[$technician->id] = $activeTickets;
        }

        // Find technician with least workload
        $minWorkload = min($workloads);
        $technicianId = array_search($minWorkload, $workloads);

        return User::find($technicianId);
    }

    /**
     * Get assignment statistics
     */
    public function getAssignmentStatistics(): array
    {
        $totalTickets = Ticket::count();
        $assignedTickets = Ticket::whereNotNull('assigned_to')->count();
        $unassignedTickets = Ticket::whereNull('assigned_to')->count();

        $technicians = User::whereHas('roles', function($query) {
            $query->where('name', 'technician');
        })->get();

        $technicianWorkload = [];
        foreach ($technicians as $technician) {
            $activeTickets = Ticket::where('assigned_to', $technician->id)
                ->whereNotIn('ticket_status_id', function($query) {
                    $query->select('id')
                        ->from('ticket_statuses')
                        ->whereIn('name', ['Closed', 'Resolved']);
                })
                ->count();
            
            $technicianWorkload[] = [
                'technician_id' => $technician->id,
                'name' => $technician->first_name . ' ' . $technician->last_name,
                'active_tickets' => $activeTickets,
            ];
        }

        return [
            'total_tickets' => $totalTickets,
            'assigned_tickets' => $assignedTickets,
            'unassigned_tickets' => $unassignedTickets,
            'assignment_rate' => $totalTickets > 0 ? round(($assignedTickets / $totalTickets) * 100, 2) : 0,
            'technician_workload' => $technicianWorkload,
        ];
    }
}
