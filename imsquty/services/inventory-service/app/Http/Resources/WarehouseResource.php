<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WarehouseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'location' => $this->location,
            'address' => $this->address,
            'is_active' => (bool) $this->is_active,
            'total_items' => $this->when(
                $this->relationLoaded('items'),
                fn() => $this->items->count()
            ),
            'total_stock_value' => $this->when(
                $this->relationLoaded('items'),
                fn() => $this->items->sum(function ($item) {
                    return $item->quantity * $item->unit_price;
                })
            ),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String()
        ];
    }
}
