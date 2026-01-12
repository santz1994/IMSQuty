<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Permission;
use Shared\Traits\ApiResponses;

class PermissionController extends Controller
{
    use ApiResponses;

    public function index(): JsonResponse
    {
        $permissions = Permission::all();
        return $this->successResponse($permissions, 'Permissions retrieved successfully');
    }

    public function show(Permission $permission): JsonResponse
    {
        return $this->successResponse($permission, 'Permission retrieved successfully');
    }
}
