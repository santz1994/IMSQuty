<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;

/**
 * User Profile Service
 * 
 * Business logic for user profile management
 */
class UserProfileService
{
    public function __construct(
        private UserRepository $repository
    ) {}

    /**
     * Get user profile with full details
     * 
     * @param int $id
     * @return User|null
     */
    public function getUserProfile(int $id): ?User
    {
        return $this->repository->findWithRelations($id);
    }

    /**
     * Update user profile information
     * 
     * @param int $id
     * @param array $data
     * @return User|null
     */
    public function updateProfile(int $id, array $data): ?User
    {
        $user = $this->repository->find($id);
        
        if (!$user) {
            return null;
        }
        
        DB::beginTransaction();
        
        try {
            $oldValues = $user->only(['first_name', 'last_name', 'phone', 'bio', 'timezone']);
            
            // Update basic profile info
            $updateData = array_intersect_key($data, array_flip([
                'first_name', 'last_name', 'phone', 'bio', 'timezone', 'language'
            ]));
            
            $user->update($updateData);
            
            // Create audit log
            $this->repository->createAuditLog([
                'user_id' => auth()->id() ?? $id,
                'action' => 'updated_profile',
                'auditable_type' => User::class,
                'auditable_id' => $user->id,
                'old_values' => json_encode($oldValues),
                'new_values' => json_encode($updateData),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
            
            DB::commit();
            
            return $user->fresh(['roles', 'permissions', 'division']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Upload user avatar
     * 
     * @param int $id
     * @param UploadedFile $file
     * @return User|null
     */
    public function uploadAvatar(int $id, UploadedFile $file): ?User
    {
        $user = $this->repository->find($id);
        
        if (!$user) {
            return null;
        }
        
        DB::beginTransaction();
        
        try {
            // Delete old avatar if exists
            if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
                Storage::disk('public')->delete($user->avatar_path);
            }
            
            // Store new avatar
            $path = $file->store('avatars', 'public');
            
            $user->update([
                'avatar_path' => $path,
                'avatar_url' => Storage::url($path)
            ]);
            
            // Create audit log
            $this->repository->createAuditLog([
                'user_id' => auth()->id() ?? $id,
                'action' => 'uploaded_avatar',
                'auditable_type' => User::class,
                'auditable_id' => $user->id,
                'old_values' => null,
                'new_values' => json_encode(['avatar_path' => $path]),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
            
            DB::commit();
            
            return $user->fresh(['roles', 'permissions']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Remove user avatar
     * 
     * @param int $id
     * @return User|null
     */
    public function removeAvatar(int $id): ?User
    {
        $user = $this->repository->find($id);
        
        if (!$user) {
            return null;
        }
        
        DB::beginTransaction();
        
        try {
            $oldPath = $user->avatar_path;
            
            // Delete avatar file if exists
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
            
            $user->update([
                'avatar_path' => null,
                'avatar_url' => null
            ]);
            
            // Create audit log
            $this->repository->createAuditLog([
                'user_id' => auth()->id() ?? $id,
                'action' => 'removed_avatar',
                'auditable_type' => User::class,
                'auditable_id' => $user->id,
                'old_values' => json_encode(['avatar_path' => $oldPath]),
                'new_values' => null,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
            
            DB::commit();
            
            return $user->fresh(['roles', 'permissions']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update user preferences
     * 
     * @param int $id
     * @param array $preferences
     * @return User|null
     */
    public function updatePreferences(int $id, array $preferences): ?User
    {
        $user = $this->repository->find($id);
        
        if (!$user) {
            return null;
        }
        
        DB::beginTransaction();
        
        try {
            $oldPreferences = $user->preferences;
            
            $user->update([
                'preferences' => json_encode($preferences)
            ]);
            
            // Create audit log
            $this->repository->createAuditLog([
                'user_id' => auth()->id() ?? $id,
                'action' => 'updated_preferences',
                'auditable_type' => User::class,
                'auditable_id' => $user->id,
                'old_values' => $oldPreferences,
                'new_values' => json_encode($preferences),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
            
            DB::commit();
            
            return $user->fresh(['roles', 'permissions']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get user activity log
     * 
     * @param int $id
     * @param int $perPage
     * @return LengthAwarePaginator|null
     */
    public function getActivityLog(int $id, int $perPage = 20): ?LengthAwarePaginator
    {
        $user = $this->repository->find($id);
        
        if (!$user) {
            return null;
        }
        
        return \App\Models\AuditLog::where('auditable_type', User::class)
            ->where('auditable_id', $id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Change user password
     * 
     * @param int $id
     * @param string $currentPassword
     * @param string $newPassword
     * @return bool|null Returns null if user not found, false if current password incorrect, true on success
     */
    public function changePassword(int $id, string $currentPassword, string $newPassword): ?bool
    {
        $user = $this->repository->find($id);
        
        if (!$user) {
            return null;
        }
        
        // Verify current password
        if (!Hash::check($currentPassword, $user->password)) {
            return false;
        }
        
        DB::beginTransaction();
        
        try {
            $user->update([
                'password' => Hash::make($newPassword)
            ]);
            
            // Create audit log
            $this->repository->createAuditLog([
                'user_id' => auth()->id() ?? $id,
                'action' => 'changed_password',
                'auditable_type' => User::class,
                'auditable_id' => $user->id,
                'old_values' => null,
                'new_values' => null, // Never log passwords
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
            
            DB::commit();
            
            return true;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
