<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Auditable;

/**
 * AssetType Model
 * 
 * Represents categories of assets (e.g., Desktop, Laptop, Monitor, Printer, Network Device).
 * Used to classify assets into major groups for reporting and filtering.
 * 
 * @property int $id
 * @property string $name Type name (e.g., "Desktop Computer")
 * @property string|null $code Unique code (e.g., "DESKTOP")
 * @property string|null $description Description
 * @property string|null $icon Icon class or image path
 * @property bool $is_active Active status
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property int|null $deleted_by
 */
class AssetType extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    /**
     * Table name
     *
     * @var string
     */
    protected $table = 'asset_types';

    /**
     * Mass assignable attributes
     *
     * @var array<string>
     */
    protected $fillable = [
        'type_name',
        'abbreviation',
        'spare',
    ];

    /**
     * Attributes that should be cast
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ========================
    // RELATIONSHIPS
    // ========================

    /**
     * Get all asset models of this type
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function assetModels()
    {
        return $this->hasMany(AssetModel::class, 'asset_type_id');
    }

    /**
     * Get all assets of this type (through assetModels)
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasManyThrough
     */
    public function assets()
    {
        return $this->hasManyThrough(
            Asset::class,
            AssetModel::class,
            'asset_type_id', // Foreign key on asset_models
            'model_id',      // Foreign key on assets
            'id',            // Local key on asset_types
            'id'             // Local key on asset_models
        );
    }

    // ========================
    // QUERY SCOPES
    // ========================

    /**
     * Scope: Only active asset types
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Only inactive asset types
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope: Search by name or code
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('type_name', 'LIKE', "%{$search}%")
              ->orWhere('abbreviation', 'LIKE', "%{$search}%");
        });
    }

    // ========================
    // ACCESSORS & MUTATORS
    // ========================

    /**
     * Get name attribute (mapped from type_name)
     * Monolith field name: type_name → API field name: name
     *
     * @return string|null
     */
    public function getNameAttribute()
    {
        return $this->attributes['type_name'] ?? null;
    }

    /**
     * Set name attribute (mapped to type_name)
     * API field name: name → Monolith field name: type_name
     *
     * @param string $value
     * @return void
     */
    public function setNameAttribute($value)
    {
        $this->attributes['type_name'] = $value;
    }

    /**
     * Get code attribute (mapped from abbreviation)
     * Monolith field name: abbreviation → API field name: code
     *
     * @return string|null
     */
    public function getCodeAttribute()
    {
        return $this->attributes['abbreviation'] ?? null;
    }

    /**
     * Set code attribute (mapped to abbreviation)
     * API field name: code → Monolith field name: abbreviation
     *
     * @param string $value
     * @return void
     */
    public function setCodeAttribute($value)
    {
        $this->attributes['abbreviation'] = $value;
    }

    /**
     * Get is_active attribute (mapped from spare field)
     * Monolith: spare=true means "spare part", so invert for is_active
     * Note: This might need business logic review
     *
     * @return bool
     */
    public function getIsActiveAttribute()
    {
        // If spare is true, it's not actively used = is_active should be false
        return !($this->attributes['spare'] ?? false);
    }

    /**
     * Set is_active attribute (mapped to spare)
     *
     * @param bool $value
     * @return void
     */
    public function setIsActiveAttribute($value)
    {
        $this->attributes['spare'] = !$value;
    }

    /**
     * Get icon attribute (placeholder)
     * Monolith doesn't have this field - return default or null
     *
     * @return string|null
     */
    public function getIconAttribute()
    {
        return null; // Monolith doesn't store icon, could return default SVG name
    }

    /**
     * Set icon attribute (no-op for monolith)
     *
     * @param string|null $value
     * @return void
     */
    public function setIconAttribute($value)
    {
        // Icon not stored in monolith, silently ignore
    }

    /**
     * Get description attribute (placeholder)
     * Monolith doesn't have description field
     *
     * @return string|null
     */
    public function getDescriptionAttribute()
    {
        return null;
    }

    /**
     * Set description attribute (no-op)
     *
     * @param string|null $value
     * @return void
     */
    public function setDescriptionAttribute($value)
    {
        // Description not stored in monolith
    }
}
