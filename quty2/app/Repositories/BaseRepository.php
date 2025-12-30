<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\Paginator;
use App\Models\AuditLog;

/**
 * Base Repository Class
 * Provides common CRUD operations with eager loading, caching, and audit logging
 * 
 * Usage:
 *   class AssetRepository extends BaseRepository {
 *       public function __construct(Asset $model) {
 *           parent::__construct($model);
 *           $this->with = ['owner', 'assetType'];
 *           $this->withCount = ['maintenanceLogs'];
 *       }
 *   }
 */
abstract class BaseRepository
{
    protected Model $model;
    protected array $with = [];
    protected array $withCount = [];
    protected bool $logAudit = true;

    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * Get all records with eager loading
     */
    public function getAll(): Collection
    {
        return $this->applyIncludes($this->model)->get();
    }

    /**
     * Get paginated results with eager loading
     */
    public function paginate($perPage = 15)
    {
        return $this->applyIncludes($this->model)->paginate($perPage);
    }

    /**
     * Get single record by ID with eager loading
     */
    public function findById($id)
    {
        return $this->applyIncludes($this->model)->findOrFail($id);
    }

    /**
     * Get by attribute with eager loading
     */
    public function findBy($attribute, $value)
    {
        return $this->applyIncludes($this->model)->where($attribute, $value)->first();
    }

    /**
     * Apply eager loading to query
     */
    protected function applyIncludes($query)
    {
        if (!empty($this->with)) {
            $query = $query->with($this->with);
        }

        if (!empty($this->withCount)) {
            $query = $query->withCount($this->withCount);
        }

        return $query;
    }

    /**
     * Create new record with audit log
     */
    public function create(array $data)
    {
        $record = $this->model->create($data);
        
        if ($this->logAudit) {
            $this->logAuditEvent('created', $record, null, $data);
        }

        return $record;
    }

    /**
     * Update record with audit log
     */
    public function update($id, array $data)
    {
        $record = $this->findById($id);
        $originalValues = $record->getAttributes();
        
        $record->update($data);
        
        if ($this->logAudit) {
            $this->logAuditEvent('updated', $record, $originalValues, $data);
        }

        return $record;
    }

    /**
     * Delete record with audit log
     */
    public function delete($id)
    {
        $record = $this->findById($id);
        
        if ($this->logAudit) {
            $this->logAuditEvent('deleted', $record, $record->getAttributes(), null);
        }

        $record->delete();

        return true;
    }

    /**
     * Batch create records
     */
    public function createBatch(array $records)
    {
        $created = [];
        foreach ($records as $data) {
            $created[] = $this->create($data);
        }
        return $created;
    }

    /**
     * Batch update records
     */
    public function updateBatch(array $updates)
    {
        $updated = [];
        foreach ($updates as $id => $data) {
            $updated[$id] = $this->update($id, $data);
        }
        return $updated;
    }

    /**
     * Log audit event - COMPREHENSIVE
     */
    protected function logAuditEvent($action, Model $model, $oldValues = null, $newValues = null)
    {
        try {
            AuditLog::create([
                'user_id' => auth()->id(),
                'model_type' => class_basename($model),
                'model_id' => $model->id,
                'action' => $action,
                'old_values' => $oldValues ? json_encode($oldValues) : null,
                'new_values' => $newValues ? json_encode($newValues) : null,
                'ip_address' => request()->ip(),
                'user_agent' => request()->header('User-Agent'),
                'url' => request()->fullUrl(),
            ]);
        } catch (\Exception $e) {
            \Log::warning("Failed to log audit event: {$e->getMessage()}");
        }
    }

    /**
     * Count all records
     */
    public function count()
    {
        return $this->model->count();
    }

    /**
     * Check if exists
     */
    public function exists($id)
    {
        return $this->model->find($id) !== null;
    }

    /**
     * Force delete (hard delete)
     */
    public function forceDelete($id)
    {
        $record = $this->model->withTrashed()->findOrFail($id);
        
        if ($this->logAudit) {
            $this->logAuditEvent('force_deleted', $record, $record->getAttributes(), null);
        }

        $record->forceDelete();

        return true;
    }

    /**
     * Restore soft deleted record
     */
    public function restore($id)
    {
        $record = $this->model->withTrashed()->findOrFail($id);
        
        if ($this->logAudit) {
            $this->logAuditEvent('restored', $record, null, null);
        }

        $record->restore();

        return $record;
    }
}
