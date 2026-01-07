<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\UpdatePreferencesRequest;
use App\Http\Resources\UserResource;
use App\Services\UserProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Shared\Traits\ApiResponses;

/**
 * User Profile Controller
 * 
 * Handles user profile management
 */
class UserProfileController extends Controller
{
    use ApiResponses;

    public function __construct(
        private UserProfileService $profileService
    ) {}

    /**
     * Get user profile
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $user = $this->profileService->getUserProfile($id);
        
        if (!$user) {
            return $this->notFoundResponse('User not found');
        }
        
        return $this->successResponse(
            new UserResource($user),
            'User profile retrieved successfully'
        );
    }

    /**
     * Update user profile
     * 
     * @param UpdateProfileRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function update(UpdateProfileRequest $request, int $id): JsonResponse
    {
        $user = $this->profileService->updateProfile($id, $request->validated());
        
        if (!$user) {
            return $this->notFoundResponse('User not found');
        }
        
        return $this->successResponse(
            new UserResource($user),
            'Profile updated successfully'
        );
    }

    /**
     * Upload user avatar
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function uploadAvatar(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048' // 2MB max
        ]);
        
        $user = $this->profileService->uploadAvatar($id, $request->file('avatar'));
        
        if (!$user) {
            return $this->notFoundResponse('User not found');
        }
        
        return $this->successResponse(
            new UserResource($user),
            'Avatar uploaded successfully'
        );
    }

    /**
     * Remove user avatar
     * 
     * @param int $id
     * @return JsonResponse
     */
    public function removeAvatar(int $id): JsonResponse
    {
        $user = $this->profileService->removeAvatar($id);
        
        if (!$user) {
            return $this->notFoundResponse('User not found');
        }
        
        return $this->successResponse(
            new UserResource($user),
            'Avatar removed successfully'
        );
    }

    /**
     * Update user preferences
     * 
     * @param UpdatePreferencesRequest $request
     * @param int $id
     * @return JsonResponse
     */
    public function updatePreferences(UpdatePreferencesRequest $request, int $id): JsonResponse
    {
        $user = $this->profileService->updatePreferences($id, $request->validated());
        
        if (!$user) {
            return $this->notFoundResponse('User not found');
        }
        
        return $this->successResponse(
            new UserResource($user),
            'Preferences updated successfully'
        );
    }

    /**
     * Get user activity log
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function activityLog(Request $request, int $id): JsonResponse
    {
        $perPage = $request->input('per_page', 20);
        $activities = $this->profileService->getActivityLog($id, $perPage);
        
        if ($activities === null) {
            return $this->notFoundResponse('User not found');
        }
        
        return $this->paginatedResponse(
            [
                'data' => $activities->items(),
                'current_page' => $activities->currentPage(),
                'total' => $activities->total(),
                'per_page' => $activities->perPage(),
                'last_page' => $activities->lastPage(),
            ],
            'Activity log retrieved successfully'
        );
    }

    /**
     * Change user password
     * 
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function changePassword(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'
            ],
        ], [
            'new_password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ]);
        
        $result = $this->profileService->changePassword(
            $id,
            $request->input('current_password'),
            $request->input('new_password')
        );
        
        if ($result === false) {
            return $this->errorResponse('Current password is incorrect', 400);
        }
        
        if ($result === null) {
            return $this->notFoundResponse('User not found');
        }
        
        return $this->successResponse(
            null,
            'Password changed successfully'
        );
    }
}
