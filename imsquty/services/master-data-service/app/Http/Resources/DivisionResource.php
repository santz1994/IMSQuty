<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Division Resource
 * 
 * Transforms Division model to JSON response
 */
class DivisionResource extends JsonResource
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
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'parent' => $this->when($this->relationLoaded('parent'), function () {
                return $this->parent ? new self($this->parent) : null;
            }),
            'children' => $this->when($this->relationLoaded('children'), function () {
                return self::collection($this->children);
            }),
            'manager' => $this->when($this->relationLoaded('manager'), [
                'id' => $this->manager?->id,
                'name' => $this->manager?->first_name . ' ' . $this->manager?->last_name,
                'email' => $this->manager?->email,
            ]),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}
