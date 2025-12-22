<?php

namespace App\Repositories;

use App\Models\Notification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Notification Repository
 * 
 * Data access layer for notifications
 */
class NotificationRepository
{
    /**
     * Get all notifications with pagination and filtering
     */
    public function getAll(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Notification::with('user');

        // Filter by user
        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        // Filter by type
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by channel
        if (!empty($filters['channel'])) {
            $query->where('channel', $filters['channel']);
        }

        // Filter by date range
        if (!empty($filters['start_date'])) {
            $query->where('created_at', '>=', $filters['start_date']);
        }
        if (!empty($filters['end_date'])) {
            $query->where('created_at', '<=', $filters['end_date']);
        }

        // Search by subject or body
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Find notification by ID
     */
    public function findById(int $id): ?Notification
    {
        return Notification::with('user')->find($id);
    }

    /**
     * Get notifications ready to send
     */
    public function getReadyToSend(int $limit = 100): Collection
    {
        return Notification::readyToSend()
                          ->orderBy('priority', 'desc')
                          ->orderBy('created_at', 'asc')
                          ->limit($limit)
                          ->get();
    }

    /**
     * Get pending notifications
     */
    public function getPending(int $limit = 100): Collection
    {
        return Notification::pending()
                          ->orderBy('priority', 'desc')
                          ->orderBy('created_at', 'asc')
                          ->limit($limit)
                          ->get();
    }

    /**
     * Get failed notifications that can be retried
     */
    public function getRetryable(int $maxRetries = 3): Collection
    {
        return Notification::failed()
                          ->where('retry_count', '<', $maxRetries)
                          ->orderBy('priority', 'desc')
                          ->limit(50)
                          ->get();
    }

    /**
     * Create new notification
     */
    public function create(array $data): Notification
    {
        return Notification::create($data);
    }

    /**
     * Update notification
     */
    public function update(int $id, array $data): bool
    {
        $notification = $this->findById($id);
        if (!$notification) {
            return false;
        }

        return $notification->update($data);
    }

    /**
     * Delete notification (soft delete)
     */
    public function delete(int $id): bool
    {
        $notification = $this->findById($id);
        if (!$notification) {
            return false;
        }

        return $notification->delete();
    }

    /**
     * Get statistics
     */
    public function getStatistics(): array
    {
        return [
            'total_notifications' => Notification::count(),
            'pending_count' => Notification::where('status', 'Pending')->count(),
            'sent_count' => Notification::where('status', 'Sent')->count(),
            'failed_count' => Notification::where('status', 'Failed')->count(),
            'by_type' => Notification::selectRaw('type, COUNT(*) as count')
                                    ->groupBy('type')
                                    ->pluck('count', 'type')
                                    ->toArray(),
            'by_channel' => Notification::selectRaw('channel, COUNT(*) as count')
                                       ->groupBy('channel')
                                       ->pluck('count', 'channel')
                                       ->toArray()
        ];
    }

    /**
     * Get user's notification history
     */
    public function getUserNotifications(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Notification::where('user_id', $userId)
                          ->latest()
                          ->paginate($perPage);
    }

    /**
     * Mark as sent
     */
    public function markAsSent(int $id): bool
    {
        $notification = $this->findById($id);
        if (!$notification) {
            return false;
        }

        $notification->markAsSent();
        return true;
    }

    /**
     * Mark as failed
     */
    public function markAsFailed(int $id, string $errorMessage): bool
    {
        $notification = $this->findById($id);
        if (!$notification) {
            return false;
        }

        $notification->markAsFailed($errorMessage);
        return true;
    }
}
