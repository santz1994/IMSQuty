<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

/**
 * User Controller
 * 
 * Handles CRUD operations for users
 * Delegates business logic to UserService
 */
class UserController extends Controller
{
    use ApiResponses;
    public function __construct(
        private UserService $userService
    ) {}

    /**
     * Get all users with filtering and pagination
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'role', 'search', 'division_id']);
        $perPage = $request->input('per_page', 15);
        
        $users = $this->userService->getAllUsers($filters, $perPage);
        
        // Transform paginated users with UserResource
        $users->getCollection()->transform(function ($user) {
            return new UserResource($user);
        });
        
        return $this->paginatedResponse($users, 'Users retrieved successfully');
    }

    /**
     * Get single user by ID
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);
        
        if (!$user) {
            return $this->notFoundResponse('User not found');
        }
        
        return $this->successResponse(
            new UserResource($user),
            'User retrieved successfully'
        );
    }

    /**
     * Create new user
     * 
     * @param CreateUserRequest $request
     * @return JsonResponse
     */
    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = $this->userService->createUser($request->validated());
        
        return $this->createdResponse(
            new UserResource($user),
            'User created successfully'
        );
    }

    /**
     * Update existing user
     * 
     * @param UpdateUserRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = $this->userService->updateUser($id, $request->validated());
        
        if (!$user) {
            return $this->notFoundResponse('User not found');
        }
        
        return $this->successResponse(
            new UserResource($user),
            'User updated successfully'
        );
    }

    /**
     * Delete user (soft delete)
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $result = $this->userService->deleteUser($id);
        
        if (!$result) {
            return $this->notFoundResponse('User not found');
        }
        
        return $this->deletedResponse('User deleted successfully');
    }

    /**
     * Restore soft-deleted user
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function restore(int $id): JsonResponse
    {
        $user = $this->userService->restoreUser($id);
        
        if (!$user) {
            return $this->notFoundResponse('User not found or not deleted');
        }
        
        return $this->successResponse(
            new UserResource($user),
            'User restored successfully'
        );
    }

    /**
     * Assign roles to user
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function assignRoles(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name'
        ]);
        
        $user = $this->userService->assignRoles($id, $request->input('roles'));
        
        if (!$user) {
            return $this->notFoundResponse('User not found');
        }
        
        return $this->successResponse(
            new UserResource($user),
            'Roles assigned successfully'
        );
    }

    /**
     * Get user's permissions
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function permissions(int $id): JsonResponse
    {
        $permissions = $this->userService->getUserPermissions($id);
        
        if ($permissions === null) {
            return $this->notFoundResponse('User not found');
        }
        
        return $this->successResponse(
            $permissions,
            'User permissions retrieved successfully'
        );
    }
}
