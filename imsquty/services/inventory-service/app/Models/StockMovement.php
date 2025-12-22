<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'movement_type',
        'quantity',
        'from_warehouse_id',
        'to_warehouse_id',
        'moved_by',
        'moved_at',
        'notes',
        'reference_number'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'moved_at' => 'datetime',
        'created_at' => 'datetime'
    ];

    const TYPE_IN = 'IN';
    const TYPE_OUT = 'OUT';
    const TYPE_TRANSFER = 'TRANSFER';
    const TYPE_ADJUSTMENT = 'ADJUSTMENT';

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function fromWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'from_warehouse_id');
    }

    public function toWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'to_warehouse_id');
    }
}
