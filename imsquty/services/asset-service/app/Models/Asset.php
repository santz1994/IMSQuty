<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\Auditable;
use App\Traits\HasUUID;
use App\Traits\HasAudit;

/**
 * Asset Model
 * 
 * Represents physical assets tracked by the organization.
 * Maps to imsquty.assets table with minimal fields.
 *
 * @property int $id
 * @property string $asset_tag Unique identifier (e.g., AST-001)
 * @property string|null $name Asset name/description
 * @property string|null $serial_number Manufacturer serial number
 * @property int|null $location_id Foreign key to locations
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 * @property \Carbon\Carbon|null $deleted_at
 */
class Asset extends Model
{
    use HasFactory, SoftDeletes, Auditable, HasUUID, HasAudit;

    protected $table = 'assets';

    protected $fillable = [
        'asset_tag',
        'name',
        'serial_number',
        'qr_code',
        'model_id',
        'status_id',
        'movement_id',
        'location_id',
        'division_id',
        'supplier_id',
        'warranty_type_id',
        'assigned_to',
        'invoice_id',
        'purchase_order_id',
        'notes',
        'ip_address',
        'mac_address',
        'purchase_date',
        'warranty_months',
    ];

    protected $casts = [
        'location_id' => 'integer',
        'model_id' => 'integer',
        'status_id' => 'integer',
        'assigned_to' => 'integer',
        'division_id' => 'integer',
        'supplier_id' => 'integer',
        'warranty_type_id' => 'integer',
        'purchase_date' => 'date',
        'warranty_months' => 'integer',
    ];

    /**
     * Get the location where asset is stored
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Get the asset model/specification
     */
    public function assetModel()
    {
        return $this->belongsTo(AssetModel::class, 'model_id');
    }

    /**
     * Get the asset status
     */
    public function status()
    {
        return $this->belongsTo(Status::class, 'status_id');
    }

    /**
     * Scope: Filter by location
     */
    public function scopeByLocation($query, $locationId)
    {
        return $query->where('location_id', $locationId);
    }

    /**
     * Scope: Filter by asset tag
     */
    public function scopeByAssetTag($query, $assetTag)
    {
        return $query->where('asset_tag', $assetTag);
    }

    /**
     * Scope: Filter by serial number
     */
    public function scopeBySerial($query, $serial)
    {
        return $query->where('serial_number', $serial);
    }

    /**
     * Scope: Search across name, asset_tag, serial_number
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('name', 'like', "%$search%")
                     ->orWhere('asset_tag', 'like', "%$search%")
                     ->orWhere('serial_number', 'like', "%$search%");
    }

    /**
     * Get the warranty expiry date (calculated from purchase_date + warranty_months)
     */
    public function getWarrantyExpiryDateAttribute()
    {
        if ($this->purchase_date && $this->warranty_months) {
            return $this->purchase_date->addMonths($this->warranty_months)->toDateString();
        }
        return null;
    }
}
