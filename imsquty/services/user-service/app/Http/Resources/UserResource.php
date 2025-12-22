<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * User Resource
 * 
 * Transforms User model to JSON response
 */
class UserResource extends JsonResource
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
            'username' => $this->username,
            'email' => $this->email,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->getFullNameAttribute(),
            'phone' => $this->phone,
            'status' => $this->status,
            'division' => $this->when($this->relationLoaded('division'), [
                'id' => $this->division?->id,
                'name' => $this->division?->name,
            ]),
            'roles' => $this->when($this->relationLoaded('roles'), 
                $this->roles->map(fn($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'display_name' => $role->display_name ?? ucfirst($role->name),
                ])
            ),
            'permissions' => $this->when($this->relationLoaded('permissions'),
                $this->permissions->pluck('name')
            ),
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'last_login' => $this->last_login?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
