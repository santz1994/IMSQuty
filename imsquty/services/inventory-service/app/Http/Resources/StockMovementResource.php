<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'inventory_item_id' => $this->inventory_item_id,
            'item_name' => $this->item?->name,
            'item_sku' => $this->item?->sku,
            'movement_type' => $this->movement_type,
            'quantity' => $this->quantity,
            'from_warehouse' => $this->fromWarehouse ? [
                'id' => $this->fromWarehouse->id,
                'name' => $this->fromWarehouse->name
            ] : null,
            'to_warehouse' => $this->toWarehouse ? [
                'id' => $this->toWarehouse->id,
                'name' => $this->toWarehouse->name
            ] : null,
            'reference_number' => $this->reference_number,
            'notes' => $this->notes,
            'moved_by' => $this->moved_by,
            'moved_at' => $this->moved_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String()
        ];
    }
}
