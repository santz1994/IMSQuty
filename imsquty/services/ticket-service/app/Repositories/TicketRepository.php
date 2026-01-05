<?php

namespace App\Repositories;

use App\Models\Ticket;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Shared\Repositories\BaseRepository;

class TicketRepository extends BaseRepository
{
    /**
     * Specify Model class name
     *
     * @return string
     */
    protected function model(): string
    {
        return Ticket::class;
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
