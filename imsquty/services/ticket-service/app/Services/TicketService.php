<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\TicketComment;
use App\Models\TicketHistory;
use App\Models\AuditLog;
use App\Repositories\TicketRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Shared\Helpers\CacheHelper;
use Exception;

class TicketService
{
    protected $ticketRepository;

    public function __construct(TicketRepository $ticketRepository)
    {
        $this->ticketRepository = $ticketRepository;
    }

    /**
     * Get all tickets with filters
     */
    public function getAllTickets(array $filters = [], int $perPage = 15)
    {
        return $this->ticketRepository->getAll($filters, $perPage);
    }

    /**
     * Get ticket by ID
     */
    public function getTicketById(int $id): ?Ticket
    {
        return $this->ticketRepository->findById($id);
    }

    /**
     * Create new ticket
     */
    public function createTicket(array $data): Ticket
    {
        DB::beginTransaction();

        try {
            // Calculate SLA due date based on priority
            if (isset($data['ticket_priority_id'])) {
                $priority = CacheHelper::getTicketPriority($data['ticket_priority_id']);
                if ($priority) {
                    $data['sla_due'] = now()->addHours($priority->sla_hours);
                }
            }

            // Set default status to "New" if not provided
            if (!isset($data['ticket_status_id'])) {
                $newStatus = CacheHelper::getTicketStatusByName('New');
                $data['ticket_status_id'] = $newStatus ? $newStatus->id : 1;
            }

            // Create ticket
            $ticket = $this->ticketRepository->create($data);

            // Log creation in ticket history
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'field_changed' => 'created',
                'old_value' => null,
                'new_value' => 'Ticket created',
                'changed_by_user_id' => Auth::id(),
                'changed_at' => now(),
                'change_type' => 'field_change',
                'event_type' => 'create',
            ]);

            // Audit log
            AuditLog::log('created', $ticket);

            DB::commit();

            return $ticket->load(['user', 'status', 'priority', 'type']);
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update ticket
     */
    public function updateTicket(Ticket $ticket, array $data): Ticket
    {
        DB::beginTransaction();

        try {
            $oldValues = $ticket->only(array_keys($data));

            // Track changes for history
            $this->trackChanges($ticket, $data);

            // Update ticket
            $this->ticketRepository->update($ticket, $data);

            // Audit log
            AuditLog::log('updated', $ticket, $oldValues, $data);

            DB::commit();

            return $ticket->fresh(['user', 'assignedTo', 'status', 'priority', 'type']);
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete ticket (soft delete)
     */
    public function deleteTicket(Ticket $ticket): bool
    {
        DB::beginTransaction();

        try {
            // Audit log before deletion
            AuditLog::log('deleted', $ticket);

            // Soft delete
            $result = $this->ticketRepository->delete($ticket);

            // Log in history
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'field_changed' => 'deleted',
                'old_value' => 'Active',
                'new_value' => 'Deleted',
                'changed_by_user_id' => Auth::id(),
                'changed_at' => now(),
                'change_type' => 'field_change',
                'event_type' => 'delete',
            ]);

            DB::commit();

            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Restore soft-deleted ticket
     */
    public function restoreTicket(int $id): bool
    {
        DB::beginTransaction();

        try {
            $result = $this->ticketRepository->restore($id);

            if ($result) {
                $ticket = $this->ticketRepository->findById($id);

                // Log restoration in history
                TicketHistory::create([
                    'ticket_id' => $id,
                    'field_changed' => 'restored',
                    'old_value' => 'Deleted',
                    'new_value' => 'Active',
                    'changed_by_user_id' => Auth::id(),
                    'changed_at' => now(),
                    'change_type' => 'field_change',
                    'event_type' => 'restore',
                ]);

                // Audit log
                AuditLog::log('restored', $ticket);
            }

            DB::commit();

            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Assign ticket to user
     */
    public function assignTicket(Ticket $ticket, int $userId, string $assignmentType = 'manual'): Ticket
    {
        DB::beginTransaction();

        try {
            $oldAssignee = $ticket->assigned_to;

            $data = [
                'assigned_to' => $userId,
                'assigned_at' => now(),
                'assignment_type' => $assignmentType,
            ];

            $this->ticketRepository->update($ticket, $data);

            // Log assignment in history
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'field_changed' => 'assigned_to',
                'old_value' => $oldAssignee,
                'new_value' => $userId,
                'changed_by_user_id' => Auth::id(),
                'changed_at' => now(),
                'change_type' => 'field_change',
                'event_type' => 'update',
            ]);

            // Audit log
            AuditLog::log('assigned', $ticket, ['assigned_to' => $oldAssignee], ['assigned_to' => $userId]);

            DB::commit();

            return $ticket->fresh(['assignedTo', 'user', 'status', 'priority']);
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Add comment to ticket
     */
    public function addComment(Ticket $ticket, string $comment, bool $isInternal = false): TicketComment
    {
        DB::beginTransaction();

        try {
            $ticketComment = TicketComment::create([
                'ticket_id' => $ticket->id,
                'user_id' => Auth::id(),
                'comment' => $comment,
                'is_internal' => $isInternal,
            ]);

            // Log in history
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'field_changed' => 'comment_added',
                'old_value' => null,
                'new_value' => substr($comment, 0, 100),
                'changed_by_user_id' => Auth::id(),
                'changed_at' => now(),
                'change_type' => 'comment',
                'event_type' => 'update',
            ]);

            DB::commit();

            return $ticketComment->load('user');
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Change ticket status
     */
    public function changeStatus(Ticket $ticket, int $newStatusId): Ticket
    {
        DB::beginTransaction();

        try {
            $oldStatusId = $ticket->ticket_status_id;
            $newStatus = \App\Models\TicketsStatus::find($newStatusId);

            // Validate status transition
            $this->validateStatusTransition($ticket, $newStatus);

            $data = ['ticket_status_id' => $newStatusId];

            // If status is "Resolved", set resolved_at
            if ($newStatus->status === 'Resolved') {
                $data['resolved_at'] = now();

                // Set first_response_at if not already set
                if (!$ticket->first_response_at) {
                    $data['first_response_at'] = now();
                }
            }

            // If status is "Closed", set closed
            if ($newStatus->status === 'Closed') {
                $data['closed'] = now();
            }

            $this->ticketRepository->update($ticket, $data);

            // Log status change in history
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'field_changed' => 'ticket_status_id',
                'old_value' => $oldStatusId,
                'new_value' => $newStatusId,
                'changed_by_user_id' => Auth::id(),
                'changed_at' => now(),
                'change_type' => 'status_change',
                'event_type' => 'update',
            ]);

            // Audit log
            AuditLog::log('status_changed', $ticket, 
                ['status_id' => $oldStatusId], 
                ['status_id' => $newStatusId]
            );

            DB::commit();

            return $ticket->fresh(['status', 'priority', 'assignedTo']);
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Check and mark breached tickets
     */
    public function checkAndMarkBreachedTickets(): int
    {
        $overdueTickets = $this->ticketRepository->getOverdue();
        $count = 0;

        foreach ($overdueTickets as $ticket) {
            $this->ticketRepository->markAsBreached($ticket);

            // Log breach in history
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'field_changed' => 'is_breached',
                'old_value' => '0',
                'new_value' => '1',
                'changed_by_user_id' => null,
                'changed_at' => now(),
                'change_type' => 'field_change',
                'event_type' => 'update',
            ]);

            $count++;
        }

        return $count;
    }

    /**
     * Get ticket statistics
     */
    public function getStatistics(): array
    {
        return $this->ticketRepository->getStatistics();
    }

    /**
     * Track field changes for history
     */
    protected function trackChanges(Ticket $ticket, array $newData): void
    {
        $trackedFields = [
            'subject',
            'description',
            'ticket_status_id', 
            'ticket_priority_id', 
            'ticket_type_id',
            'assigned_to', 
            'sla_due'
        ];

        foreach ($trackedFields as $field) {
            if (isset($newData[$field]) && $ticket->{$field} != $newData[$field]) {
                TicketHistory::create([
                    'ticket_id' => $ticket->id,
                    'field_changed' => $field,
                    'old_value' => $ticket->{$field},
                    'new_value' => $newData[$field],
                    'changed_by_user_id' => Auth::id(),
                    'changed_at' => now(),
                    'change_type' => 'field_change',
                    'event_type' => 'update',
                ]);
            }
        }
    }

    /**
     * Validate status transition
     */
    protected function validateStatusTransition(Ticket $ticket, $newStatus): void
    {
        $currentStatus = $ticket->status->status;
        $targetStatus = $newStatus->status;

        // Define valid transitions
        $validTransitions = [
            'New' => ['Open', 'In Progress', 'Closed'],
            'Open' => ['In Progress', 'Resolved', 'Closed'],
            'In Progress' => ['Resolved', 'Open', 'Closed'],
            'Resolved' => ['Closed', 'Open'], // Can reopen if needed
            'Closed' => ['Open'], // Can reopen closed tickets
        ];

        if (!isset($validTransitions[$currentStatus])) {
            throw new Exception("Invalid current status: {$currentStatus}");
        }

        if (!in_array($targetStatus, $validTransitions[$currentStatus])) {
            throw new Exception("Cannot transition from {$currentStatus} to {$targetStatus}");
        }
    }
}
