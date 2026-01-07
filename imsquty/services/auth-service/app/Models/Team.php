<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Team Model
 * 
 * Represents a team within a department
 * 
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string|null $description
 * @property int $department_id
 * @property int|null $manager_id
 * @property string $team_type
 * @property \Carbon\Carbon|null $start_date
 * @property \Carbon\Carbon|null $end_date
 * @property string|null $email
 * @property string|null $slack_channel
 * @property string|null $teams_channel
 * @property int $member_count
 * @property float|null $performance_score
 * @property bool $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 */
class Team extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'teams';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'code',
        'description',
        'department_id',
        'manager_id',
        'team_type',
        'start_date',
        'end_date',
        'email',
        'slack_channel',
        'teams_channel',
        'member_count',
        'performance_score',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'department_id' => 'integer',
        'manager_id' => 'integer',
        'member_count' => 'integer',
        'performance_score' => 'decimal:2',
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the department this team belongs to
     *
     * @return BelongsTo
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the team manager
     *
     * @return BelongsTo
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get all members of this team
     *
     * @return HasMany
     */
    public function members(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get active members only
     *
     * @return HasMany
     */
    public function activeMembers(): HasMany
    {
        return $this->members()->where('status', 'active');
    }

    /**
     * Scope: Only active teams
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Filter by team type
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $type
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('team_type', $type);
    }

    /**
     * Scope: Operational teams
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOperational($query)
    {
        return $query->where('team_type', 'operational');
    }

    /**
     * Scope: Project teams
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeProject($query)
    {
        return $query->where('team_type', 'project');
    }

    /**
     * Scope: Temporary teams
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeTemporary($query)
    {
        return $query->where('team_type', 'temporary');
    }

    /**
     * Check if team is temporary/project-based
     *
     * @return bool
     */
    public function isTemporary(): bool
    {
        return in_array($this->team_type, ['temporary', 'project']);
    }

    /**
     * Check if team has expired (for temporary teams)
     *
     * @return bool
     */
    public function isExpired(): bool
    {
        if (!$this->end_date) {
            return false;
        }

        return now()->isAfter($this->end_date);
    }

    /**
     * Get team performance rating
     *
     * @return string
     */
    public function getPerformanceRatingAttribute(): string
    {
        if (!$this->performance_score) {
            return 'N/A';
        }

        if ($this->performance_score >= 90) {
            return 'Excellent';
        } elseif ($this->performance_score >= 75) {
            return 'Good';
        } elseif ($this->performance_score >= 60) {
            return 'Average';
        } elseif ($this->performance_score >= 50) {
            return 'Below Average';
        } else {
            return 'Poor';
        }
    }

    /**
     * Get full team identifier with department
     *
     * @return string
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->department->name} - {$this->name}";
    }
}
