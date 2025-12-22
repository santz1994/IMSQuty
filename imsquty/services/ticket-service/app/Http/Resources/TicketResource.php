<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticket_code' => $this->ticket_code,
            'subject' => $this->subject,
            'description' => $this->description,
            
            // Flat fields for quick access
            'status_name' => $this->status->status ?? null,
            'priority_name' => $this->priority->priority ?? null,
            'type_name' => $this->type->type ?? null,
            
            // Status, Priority, Type (nested)
            'status' => $this->when($this->status, [
                'id' => $this->status->id ?? null,
                'name' => $this->status->status ?? null,
                'color' => $this->status->color ?? null,
            ]),
            'priority' => $this->when($this->priority, [
                'id' => $this->priority->id ?? null,
                'name' => $this->priority->priority ?? null,
                'sla_hours' => $this->priority->sla_hours ?? null,
                'color' => $this->priority->color ?? null,
            ]),
            'type' => $this->when($this->type, [
                'id' => $this->type->id ?? null,
                'name' => $this->type->type ?? null,
            ]),
            
            // User Information
            'created_by' => [
                'id' => $this->user->id,
                'name' => $this->user->name ?? $this->user->username,
                'email' => $this->user->email,
            ],
            
            // Assigned To
            'assigned_to' => $this->when($this->assignedTo, function () {
                return [
                    'id' => $this->assignedTo->id,
                    'name' => $this->assignedTo->name ?? $this->assignedTo->username,
                    'email' => $this->assignedTo->email,
                ];
            }),
            'assigned_at' => $this->assigned_at ? (is_string($this->assigned_at) ? $this->assigned_at : $this->assigned_at->toIso8601String()) : null,
            'assignment_type' => $this->assignment_type,
            
            // Location
            'location' => $this->when($this->location, function () {
                return [
                    'id' => $this->location->id,
                    'name' => $this->location->name,
                ];
            }),
            
            // Asset
            'asset' => $this->when($this->asset, function () {
                return [
                    'id' => $this->asset->id,
                    'asset_tag' => $this->asset->asset_tag,
                    'name' => $this->asset->name,
                ];
            }),
            
            // SLA Information
            'sla_due' => $this->sla_due ? (is_string($this->sla_due) ? $this->sla_due : $this->sla_due->toIso8601String()) : null,
            'first_response_at' => $this->first_response_at ? (is_string($this->first_response_at) ? $this->first_response_at : $this->first_response_at->toIso8601String()) : null,
            'resolved_at' => $this->resolved_at ? (is_string($this->resolved_at) ? $this->resolved_at : $this->resolved_at->toIso8601String()) : null,
            'closed_at' => $this->closed ? (is_string($this->closed) ? $this->closed : $this->closed->toIso8601String()) : null,
            'is_breached' => (bool) $this->is_breached,
            
            // Timestamps
            'created_at' => $this->created_at ? (is_string($this->created_at) ? $this->created_at : $this->created_at->toIso8601String()) : null,
            'updated_at' => $this->updated_at ? (is_string($this->updated_at) ? $this->updated_at : $this->updated_at->toIso8601String()) : null,
            
            // Comments count (if available)
            'comments_count' => $this->when($this->relationLoaded('comments'), function () {
                return $this->comments->count();
            }),
        ];
    }
}
