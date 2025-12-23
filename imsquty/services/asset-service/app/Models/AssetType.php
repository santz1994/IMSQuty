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
        'name',
        'code',
        'icon',
        'description',
        'spare',
        'is_active',
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

    // ========================
    // ATTRIBUTES (NO MUTATORS - using new schema directly)
    // ========================
    // Microservice uses: name, code, icon, description, is_active, spare, created_by/updated_by/deleted_by
    // No need for Monolith-style attribute mapping
}

