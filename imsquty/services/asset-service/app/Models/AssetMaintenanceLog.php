<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Auditable;
use Carbon\Carbon;

/**
 * AssetMaintenanceLog Model
 * 
 * Tracks maintenance activities for assets (repairs, cleaning, upgrades, inspections).
 * Maintains history for warranty claims and compliance reporting.
 * 
 * @property int $id
 * @property int $asset_id Foreign key to assets
 * @property string $maintenance_type Type (repair, cleaning, upgrade, inspection)
 * @property string $title Maintenance title/summary
 * @property string|null $description Detailed description
 * @property decimal|null $cost Cost of maintenance
 * @property int|null $performed_by User who performed maintenance
 * @property \Carbon\Carbon|null $scheduled_at Scheduled date
 * @property \Carbon\Carbon|null $completed_at Completion date
 * @property string|null $status Status (scheduled, in_progress, completed, cancelled)
 * @property string|null $notes Additional notes
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property int|null $created_by
 * @property int|null $updated_by
 */
class AssetMaintenanceLog extends Model
{
    use HasFactory, Auditable;

    /**
     * Table name
     *
     * @var string
     */
    protected $table = 'asset_maintenance_logs';

    /**
     * Mass assignable attributes
     *
     * @var array<string>
     */
    protected $fillable = [
        'asset_id',
        'maintenance_type',
        'title',
        'description',
        'cost',
        'performed_by',
        'scheduled_at',
        'completed_at',
        'status',
        'notes',
    ];

    /**
     * Attributes that should be cast
     *
     * @var array<string, string>
     */
    protected $casts = [
        'cost' => 'decimal:2',
        'scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'asset_id' => 'integer',
        'performed_by' => 'integer',
    ];

    // ========================
    // RELATIONSHIPS
    // ========================

    /**
     * Get the asset being maintained
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * Get the user who performed the maintenance
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function performer()
    {
        return $this->belongsTo(\App\Models\User::class, 'performed_by');
    }

    // ========================
    // QUERY SCOPES
    // ========================

    /**
     * Scope: Filter by asset
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $assetId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForAsset($query, $assetId)
    {
        return $query->where('asset_id', $assetId);
    }

    /**
     * Scope: Filter by maintenance type
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByType($query, $type)
    {
        return $query->where('maintenance_type', $type);
    }

    /**
     * Scope: Filter by status
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $status
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope: Scheduled maintenance
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * Scope: Completed maintenance
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope: Overdue maintenance (scheduled but not completed)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'scheduled')
            ->where('scheduled_at', '<', now());
    }

    /**
     * Scope: Upcoming maintenance (next 7 days)
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $days Number of days ahead (default 7)
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeUpcoming($query, $days = 7)
    {
        return $query->where('status', 'scheduled')
            ->whereBetween('scheduled_at', [now(), now()->addDays($days)]);
    }

    /**
     * Scope: Recent maintenance
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $days Number of days (default 30)
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Scope: Eager load common relationships
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithRelations($query)
    {
        return $query->with(['asset', 'performer']);
    }

    // ========================
    // ACCESSORS
    // ========================

    /**
     * Check if maintenance is overdue
     *
     * @return bool
     */
    public function getIsOverdueAttribute()
    {
        return $this->status === 'scheduled' 
            && $this->scheduled_at 
            && $this->scheduled_at->isPast();
    }

    /**
     * Get duration of maintenance in hours
     *
     * @return float|null
     */
    public function getDurationAttribute()
    {
        if (!$this->scheduled_at || !$this->completed_at) {
            return null;
        }

        return $this->scheduled_at->diffInHours($this->completed_at, true);
    }
}
