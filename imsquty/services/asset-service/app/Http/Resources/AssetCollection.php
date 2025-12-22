<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\ResourceCollection;

/**
 * Asset Collection
 * 
 * Transform Asset collection to JSON response with pagination metadata.
 */
class AssetCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'data' => AssetResource::collection($this->collection),
            'total' => $this->total(),
            'per_page' => $this->perPage(),
            'current_page' => $this->currentPage(),
            'last_page' => $this->lastPage(),
            'from' => $this->firstItem(),
            'to' => $this->lastItem(),
            'filters_applied' => $request->only([
                'search',
                'status_id',
                'asset_type_id',
                'division_id',
                'location_id',
                'assigned_to',
                'is_assigned',
                'warranty_status',
            ]),
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array<string, mixed>
     */
    public function with($request): array
    {
        return [];
    }
}
