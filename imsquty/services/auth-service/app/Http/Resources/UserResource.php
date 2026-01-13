<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * User API Resource
 * 
 * Transforms User model to JSON response
 * Hides sensitive fields
 * 
 * @package App\Http\Resources
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
        // Debug: Force load roles using the HasRoles trait
        $rolesCollection = $this->roles;
        \Log::info('UserResource Debug', [
            'user_id' => $this->id,
            'relationLoaded' => $this->relationLoaded('roles'),
            'roles_count' => $rolesCollection ? $rolesCollection->count() : 0,
            'roles_data' => $rolesCollection ? $rolesCollection->toArray() : []
        ]);
        
        return [
            'id' => $this->id,
            'email' => $this->email,
            'username' => $this->username,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->first_name . ' ' . $this->last_name,
            'status' => $this->status,
            'mfa_enabled' => $this->mfa_enabled,
            'email_verified_at' => $this->email_verified_at ? (is_string($this->email_verified_at) ? $this->email_verified_at : $this->email_verified_at->toIso8601String()) : null,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'last_login_at' => $this->last_login_at ? (is_string($this->last_login_at) ? $this->last_login_at : $this->last_login_at->toIso8601String()) : null,
            'last_login_ip' => $this->last_login_ip,
            'created_at' => $this->created_at ? (is_string($this->created_at) ? $this->created_at : $this->created_at->toIso8601String()) : null,
            'updated_at' => $this->updated_at ? (is_string($this->updated_at) ? $this->updated_at : $this->updated_at->toIso8601String()) : null,
            'roles' => $this->roles->map(fn($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'display_name' => $role->display_name ?? $role->name,
                'level' => $role->level ?? 6
            ])->toArray(),
        ];
    }
}
