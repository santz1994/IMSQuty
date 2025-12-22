<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class InventoryItemResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'name' => $this->name,
            'description' => $this->description,
            'quantity' => $this->quantity,
            'min_quantity' => $this->min_quantity,
            'unit' => $this->unit,
            'warehouse_id' => $this->warehouse_id,
            'warehouse' => $this->warehouse ? [
                'id' => $this->warehouse->id,
                'name' => $this->warehouse->name
            ] : null,
            'is_low_stock' => $this->quantity <= $this->min_quantity,
            'created_at' => $this->created_at?->toISOString()
        ];
    }
}
