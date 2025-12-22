<?php

namespace App\Repositories;

use App\Models\NotificationTemplate;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Notification Template Repository
 * 
 * Data access layer for notification templates
 */
class NotificationTemplateRepository
{
    /**
     * Get all templates with pagination
     */
    public function getAll(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = NotificationTemplate::query();

        // Filter by type
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        // Filter by active status
        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        // Search by name or code
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Find template by ID
     */
    public function findById(int $id): ?NotificationTemplate
    {
        return NotificationTemplate::find($id);
    }

    /**
     * Find template by code
     */
    public function findByCode(string $code): ?NotificationTemplate
    {
        return NotificationTemplate::where('code', $code)->first();
    }

    /**
     * Get active templates
     */
    public function getActive()
    {
        return NotificationTemplate::active()->get();
    }

    /**
     * Create template
     */
    public function create(array $data): NotificationTemplate
    {
        return NotificationTemplate::create($data);
    }

    /**
     * Update template
     */
    public function update(int $id, array $data): bool
    {
        $template = $this->findById($id);
        if (!$template) {
            return false;
        }

        return $template->update($data);
    }

    /**
     * Delete template
     */
    public function delete(int $id): bool
    {
        $template = $this->findById($id);
        if (!$template) {
            return false;
        }

        return $template->delete();
    }

    /**
     * Toggle active status
     */
    public function toggleActive(int $id): bool
    {
        $template = $this->findById($id);
        if (!$template) {
            return false;
        }

        return $template->update(['is_active' => !$template->is_active]);
    }
}
