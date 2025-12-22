<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Inventory Item Model
 * 
 * @property int $id
 * @property string $code
 * @property string $name
 * @property string $category
 * @property int $quantity
 * @property int $minimum_stock
 * @property string $unit_of_measure
 * @property float $unit_price
 * @property int|null $warehouse_id
 * @property string|null $location
 */
class InventoryItem extends Model
{
    use HasFactory, SoftDeletes, Auditable;

    protected $fillable = [
        'sku',
        'name',
        'description',
        'quantity',
        'min_quantity',
        'unit',
        'warehouse_id',
        'category',
        'quantity',
        'minimum_stock',
        'unit_of_measure',
        'unit_price',
        'warehouse_id',
        'location',
        'description',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'minimum_stock' => 'integer',
        'unit_price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class, 'inventory_item_id');
    }

    public function scopeLowStock($query)
    {
        return $query->whereRaw('quantity <= min_quantity');
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function isLowStock(): bool
    {
        return $this->quantity <= $this->min_quantity;
    }
}
