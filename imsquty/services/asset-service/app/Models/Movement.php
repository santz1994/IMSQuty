<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Auditable;
use Carbon\Carbon;

/**
 * Movement Model
 * 
 * Tracks asset transfers between locations/users.
 * Maintains audit trail of all asset movements for compliance and reporting.
 * 
 * @property int $id
 * @property int $asset_id Foreign key to assets
 * @property int|null $from_location_id Previous location
 * @property int|null $to_location_id New location
 * @property int|null $from_user_id Previous assigned user
 * @property int|null $to_user_id New assigned user
 * @property \Carbon\Carbon $movement_date Date of movement
 * @property string|null $reason Reason for movement
 * @property int|null $approved_by User who approved the movement
 * @property string|null $notes Additional notes
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property int|null $created_by
 * @property int|null $updated_by
 */
class Movement extends Model
{
    use HasFactory, Auditable;

    /**
     * Table name
     *
     * @var string
     */
    protected $table = 'movements';

    /**
     * Mass assignable attributes
     *
     * @var array<string>
     */
    protected $fillable = [
        'asset_id',
        'from_location_id',
        'to_location_id',
        'from_user_id',
        'to_user_id',
        'movement_date',
        'reason',
        'approved_by',
        'notes',
    ];

    /**
     * Attributes that should be cast
     *
     * @var array<string, string>
     */
    protected $casts = [
        'movement_date' => 'date',
        'asset_id' => 'integer',
        'from_location_id' => 'integer',
        'to_location_id' => 'integer',
        'from_user_id' => 'integer',
        'to_user_id' => 'integer',
        'approved_by' => 'integer',
    ];

    // ========================
    // RELATIONSHIPS
    // ========================

    /**
     * Get the asset being moved
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * Get the previous location
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function fromLocation()
    {
        return $this->belongsTo(\App\Models\Location::class, 'from_location_id');
    }

    /**
     * Get the new location
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function toLocation()
    {
        return $this->belongsTo(\App\Models\Location::class, 'to_location_id');
    }

    /**
     * Get the previous assigned user
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function fromUser()
    {
        return $this->belongsTo(\App\Models\User::class, 'from_user_id');
    }

    /**
     * Get the new assigned user
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function toUser()
    {
        return $this->belongsTo(\App\Models\User::class, 'to_user_id');
    }

    /**
     * Get the user who approved the movement
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function approver()
    {
        return $this->belongsTo(\App\Models\User::class, 'approved_by');
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
     * Scope: Filter by date range
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $startDate
     * @param string $endDate
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('movement_date', [$startDate, $endDate]);
    }

    /**
     * Scope: Recent movements
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $days Number of days (default 30)
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('movement_date', '>=', now()->subDays($days));
    }

    /**
     * Scope: Eager load common relationships
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithRelations($query)
    {
        return $query->with([
            'asset',
            'fromLocation',
            'toLocation',
            'fromUser',
            'toUser',
            'approver'
        ]);
    }

    // ========================
    // ACCESSORS
    // ========================

    /**
     * Get movement type (location, user, or both)
     *
     * @return string
     */
    public function getMovementTypeAttribute()
    {
        $hasLocationChange = $this->from_location_id || $this->to_location_id;
        $hasUserChange = $this->from_user_id || $this->to_user_id;

        if ($hasLocationChange && $hasUserChange) {
            return 'location_and_user';
        } elseif ($hasLocationChange) {
            return 'location';
        } elseif ($hasUserChange) {
            return 'user';
        }

        return 'unknown';
    }
}
