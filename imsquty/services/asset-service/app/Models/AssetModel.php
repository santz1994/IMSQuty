<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Auditable;

/**
 * AssetModel Model
 * 
 * Represents specific models/variants of assets (e.g., Dell Latitude 7490, HP ProBook 450 G8).
 * Links to AssetType (category), Manufacturer, and Pcspec (technical specifications).
 * 
 * @property int $id
 * @property int $asset_type_id Foreign key to asset_types
 * @property int|null $manufacturer_id Foreign key to manufacturers
 * @property int|null $pcspec_id Foreign key to pc_specs
 * @property string $asset_model Model name/designation
 * @property string|null $part_number Manufacturer part number
 * @property string|null $notes Additional notes
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 * @property int|null $created_by
 * @property int|null $updated_by
 * @property int|null $deleted_by
 */
class AssetModel extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    /**
     * Table name
     *
     * @var string
     */
    protected $table = 'asset_models';

    /**
     * Mass assignable attributes
     *
     * @var array<string>
     */
    protected $fillable = [
        'asset_type_id',
        'manufacturer_id',
        'pcspec_id',
        'asset_model',
        'part_number',
        'notes',
    ];

    /**
     * Attributes that should be cast
     *
     * @var array<string, string>
     */
    protected $casts = [
        'asset_type_id' => 'integer',
        'manufacturer_id' => 'integer',
        'pcspec_id' => 'integer',
    ];

    // ========================
    // RELATIONSHIPS
    // ========================

    /**
     * Get the asset type (category)
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function assetType()
    {
        return $this->belongsTo(AssetType::class, 'asset_type_id');
    }

    /**
     * Legacy alias for assetType
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function asset_type()
    {
        return $this->assetType();
    }

    /**
     * Get the manufacturer
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function manufacturer()
    {
        return $this->belongsTo(\App\Models\Manufacturer::class);
    }

    /**
     * Get the PC specification
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function pcspec()
    {
        return $this->belongsTo(\App\Models\Pcspec::class, 'pcspec_id');
    }

    /**
     * Get all assets using this model
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function assets()
    {
        return $this->hasMany(Asset::class, 'model_id');
    }

    // ========================
    // QUERY SCOPES
    // ========================

    /**
     * Scope: Filter by asset type
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $typeId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByType($query, $typeId)
    {
        return $query->where('asset_type_id', $typeId);
    }

    /**
     * Scope: Filter by manufacturer
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $manufacturerId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByManufacturer($query, $manufacturerId)
    {
        return $query->where('manufacturer_id', $manufacturerId);
    }

    /**
     * Scope: Search by model name or part number
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $search
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('asset_model', 'LIKE', "%{$search}%")
              ->orWhere('part_number', 'LIKE', "%{$search}%");
        });
    }

    /**
     * Scope: Eager load common relationships
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithRelations($query)
    {
        return $query->with(['assetType', 'manufacturer', 'pcspec']);
    }

    // ========================
    // ACCESSORS
    // ========================

    /**
     * Get name attribute (alias for asset_model)
     * Provides compatibility with views expecting 'name' attribute
     *
     * @return string
     */
    public function getNameAttribute()
    {
        return $this->asset_model;
    }

    /**
     * Get full model name with manufacturer
     *
     * @return string
     */
    public function getFullNameAttribute()
    {
        $manufacturer = $this->manufacturer ? $this->manufacturer->name . ' ' : '';
        return $manufacturer . $this->asset_model;
    }
}
