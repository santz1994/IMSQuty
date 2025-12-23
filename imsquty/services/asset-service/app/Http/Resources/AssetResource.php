<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Asset Resource
 * 
 * Transform Asset model to JSON response.
 */
class AssetResource extends JsonResource
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
            'asset_tag' => $this->asset_tag,
            'name' => $this->name,
            'serial_number' => $this->serial_number,
            'qr_code' => $this->qr_code,
            'status_id' => $this->status_id,
            'model_id' => $this->model_id,
            
            // Asset Model relationship
            'asset_model' => $this->whenLoaded('assetModel', function () {
                return [
                    'id' => $this->assetModel->id,
                    'asset_model' => $this->assetModel->asset_model ?? $this->assetModel->name,
                    'asset_type_id' => $this->assetModel->asset_type_id,
                ];
            }),
            
            // Location
            'location_id' => $this->location_id,
            'location' => $this->whenLoaded('location', function () {
                return [
                    'id' => $this->location->id,
                    'name' => $this->location->location_name ?? $this->location->name,
                ];
            }),
            
            // Status
            'status' => $this->whenLoaded('status', function () {
                return [
                    'id' => $this->status->id,
                    'name' => $this->status->name,
                    'code' => $this->status->code,
                ];
            }),
            
            // Assigned User
            'assigned_to' => $this->assigned_to,
            'assigned_user' => $this->whenLoaded('assignedTo', function () {
                return $this->assignedTo ? [
                    'id' => $this->assignedTo->id,
                    'name' => $this->assignedTo->name,
                ] : null;
            }),
            
            // Purchase Information
            'purchase_date' => $this->purchase_date,
            'warranty_months' => $this->warranty_months,
            'warranty_expiry_date' => $this->warranty_expiry_date,
            'ip_address' => $this->ip_address,
            'mac_address' => $this->mac_address,
            'notes' => $this->notes,
            
            // Timestamps
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),
        ];
    }
}
