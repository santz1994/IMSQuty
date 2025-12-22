<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * AssetModel Resource
 * 
 * Transform AssetModel model to JSON response.
 */
class AssetModelResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'asset_model' => $this->asset_model,
            'part_number' => $this->part_number,
            'name' => $this->name, // Accessor alias
            'full_name' => $this->full_name, // Accessor with manufacturer
            
            // Asset Type
            'asset_type' => $this->whenLoaded('assetType', function () {
                return [
                    'id' => $this->assetType->id,
                    'name' => $this->assetType->name,
                    'code' => $this->assetType->code,
                    'icon' => $this->assetType->icon,
                ];
            }),
            
            // Manufacturer
            'manufacturer' => $this->whenLoaded('manufacturer', function () {
                return $this->manufacturer ? [
                    'id' => $this->manufacturer->id,
                    'name' => $this->manufacturer->name,
                    'code' => $this->manufacturer->code,
                ] : null;
            }),
            
            // PC Specification
            'pcspec' => $this->whenLoaded('pcspec', function () {
                return $this->pcspec ? [
                    'id' => $this->pcspec->id,
                    'processor' => $this->pcspec->processor,
                    'ram' => $this->pcspec->ram,
                    'storage' => $this->pcspec->storage,
                    'graphics' => $this->pcspec->graphics,
                    'display' => $this->pcspec->display,
                ] : null;
            }),
            
            // Notes
            'notes' => $this->notes,
            
            // Asset counts
            'assets_count' => $this->when($this->relationLoaded('assets'), function () {
                return $this->assets->count();
            }),
            
            // Audit Information
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'deleted_by' => $this->deleted_by,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}
