<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'guard_name' => $this->guard_name,
            'display_name' => $this->display_name,
            'description' => $this->description,
            'group' => $this->group,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'users_count' => $this->users_count ?? 0,
            'permissions' => $this->permissions->map(function ($permission) {
                return [
                    'id' => $permission->id,
                    'name' => $permission->name,
                    'guard_name' => $permission->guard_name,
                    'display_name' => $permission->display_name,
                    'description' => $permission->description,
                    'group' => $permission->group,
                    'created_at' => $permission->created_at,
                    'updated_at' => $permission->updated_at,
                ];
            })->toArray(),
        ];
    }
}
