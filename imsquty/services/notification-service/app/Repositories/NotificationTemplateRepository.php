<?php

namespace App\Repositories;

use App\Models\NotificationTemplate;
use Shared\Repositories\BaseRepository;

/**
 * Notification Template Repository
 * 
 * Data access layer for notification templates
 * Extends BaseRepository for common CRUD operations
 */
class NotificationTemplateRepository extends BaseRepository
{
    /**
     * Specify the model class for this repository
     */
    protected function model(): string
    {
        return NotificationTemplate::class;
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
