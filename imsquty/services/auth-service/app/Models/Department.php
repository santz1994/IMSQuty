<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Department Model
 * 
 * Hierarchical organizational structure
 * 
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string|null $description
 * @property int|null $parent_id
 * @property int $level
 * @property int|null $manager_id
 * @property int|null $director_id
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $location
 * @property int|null $floor
 * @property string|null $building
 * @property float|null $annual_budget
 * @property int $employee_count
 * @property bool $is_active
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 */
class Department extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'departments';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'code',
        'description',
        'parent_id',
        'level',
        'manager_id',
        'director_id',
        'email',
        'phone',
        'location',
        'floor',
        'building',
        'annual_budget',
        'employee_count',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'level' => 'integer',
        'floor' => 'integer',
        'annual_budget' => 'decimal:2',
        'employee_count' => 'integer',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the parent department
     *
     * @return BelongsTo
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'parent_id');
    }

    /**
     * Get child departments
     *
     * @return HasMany
     */
    public function children(): HasMany
    {
        return $this->hasMany(Department::class, 'parent_id');
    }

    /**
     * Get all descendant departments recursively
     *
     * @return HasMany
     */
    public function descendants(): HasMany
    {
        return $this->children()->with('descendants');
    }

    /**
     * Get department manager
     *
     * @return BelongsTo
     */
    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    /**
     * Get department director
     *
     * @return BelongsTo
     */
    public function director(): BelongsTo
    {
        return $this->belongsTo(User::class, 'director_id');
    }

    /**
     * Get all users in this department
     *
     * @return HasMany
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get all teams in this department
     *
     * @return HasMany
     */
    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    /**
     * Get active teams only
     *
     * @return HasMany
     */
    public function activeTeams(): HasMany
    {
        return $this->teams()->where('is_active', true);
    }

    /**
     * Get active users only
     *
     * @return HasMany
     */
    public function activeUsers(): HasMany
    {
        return $this->users()->where('status', 'active');
    }

    /**
     * Scope: Only active departments
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Top-level departments only
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope: Departments at specific level
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $level
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeAtLevel($query, int $level)
    {
        return $query->where('level', $level);
    }

    /**
     * Get full department path (breadcrumb)
     *
     * @return string
     */
    public function getFullPathAttribute(): string
    {
        $path = [$this->name];
        $parent = $this->parent;

        while ($parent) {
            array_unshift($path, $parent->name);
            $parent = $parent->parent;
        }

        return implode(' > ', $path);
    }

    /**
     * Check if department has subdepartments
     *
     * @return bool
     */
    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }

    /**
     * Get total employee count including subdepartments
     *
     * @return int
     */
    public function getTotalEmployeeCount(): int
    {
        $count = $this->employee_count;

        foreach ($this->children as $child) {
            $count += $child->getTotalEmployeeCount();
        }

        return $count;
    }
}
