<?php

namespace App\Repositories;

use App\Models\Ticket;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class TicketRepository
{
    /**
     * Get all tickets with optional filters and pagination
     */
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Ticket::with(['user', 'assignedTo', 'status', 'priority', 'type', 'location'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if (isset($filters['status_id'])) {
            $query->where('ticket_status_id', $filters['status_id']);
        }

        if (isset($filters['priority_id'])) {
            $query->where('ticket_priority_id', $filters['priority_id']);
        }

        if (isset($filters['type_id'])) {
            $query->where('ticket_type_id', $filters['type_id']);
        }

        if (isset($filters['assigned_to'])) {
            $query->where('assigned_to', $filters['assigned_to']);
        }

        if (isset($filters['created_by'])) {
            $query->where('user_id', $filters['created_by']);
        }

        if (isset($filters['is_breached'])) {
            $query->where('is_breached', $filters['is_breached']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('subject', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('ticket_code', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->paginate($perPage);
    }

    /**
     * Find ticket by ID with relationships
     */
    public function findById(int $id): ?Ticket
    {
        return Ticket::with([
            'user', 
            'assignedTo', 
            'status', 
            'priority', 
            'type', 
            'location', 
            'asset',
            'comments.user',
            'history.changedBy'
        ])->find($id);
    }

    /**
     * Find ticket by ticket code
     */
    public function findByCode(string $ticketCode): ?Ticket
    {
        return Ticket::with(['user', 'assignedTo', 'status', 'priority', 'type'])
            ->where('ticket_code', $ticketCode)
            ->first();
    }

    /**
     * Create new ticket
     */
    public function create(array $data): Ticket
    {
        return Ticket::create($data);
    }

    /**
     * Update ticket
     */
    public function update(Ticket $ticket, array $data): bool
    {
        return $ticket->update($data);
    }

    /**
     * Delete ticket (soft delete)
     */
    public function delete(Ticket $ticket): bool
    {
        return $ticket->delete();
    }

    /**
     * Restore soft-deleted ticket
     */
    public function restore(int $id): bool
    {
        $ticket = Ticket::withTrashed()->find($id);
        return $ticket ? $ticket->restore() : false;
    }

    /**
     * Get open tickets count
     */
    public function getOpenCount(): int
    {
        return Ticket::open()->count();
    }

    /**
     * Get breached tickets count
     */
    public function getBreachedCount(): int
    {
        return Ticket::breached()->count();
    }

    /**
     * Get tickets assigned to user
     */
    public function getAssignedToUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Ticket::with(['status', 'priority', 'type'])
            ->assignedTo($userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get tickets created by user
     */
    public function getCreatedByUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Ticket::with(['status', 'priority', 'type', 'assignedTo'])
            ->createdBy($userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get tickets due soon (within hours)
     */
    public function getDueSoon(int $hours = 24): Collection
    {
        return Ticket::with(['user', 'assignedTo', 'priority'])
            ->where('is_breached', false)
            ->whereNotNull('sla_due')
            ->whereBetween('sla_due', [now(), now()->addHours($hours)])
            ->get();
    }

    /**
     * Get overdue tickets (SLA breached)
     */
    public function getOverdue(): Collection
    {
        return Ticket::with(['user', 'assignedTo', 'priority'])
            ->where('sla_due', '<', now())
            ->where('is_breached', false)
            ->whereHas('status', function ($q) {
                $q->whereIn('status', ['New', 'Open', 'In Progress']);
            })
            ->get();
    }

    /**
     * Mark ticket as breached
     */
    public function markAsBreached(Ticket $ticket): bool
    {
        return $ticket->update(['is_breached' => true]);
    }

    /**
     * Get ticket statistics
     */
    public function getStatistics(): array
    {
        return [
            'total' => Ticket::count(),
            'open' => Ticket::open()->count(),
            'closed' => Ticket::closed()->count(),
            'breached' => Ticket::breached()->count(),
            'unassigned' => Ticket::whereNull('assigned_to')->count(),
        ];
    }
}
