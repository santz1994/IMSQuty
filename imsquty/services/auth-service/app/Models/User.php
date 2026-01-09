<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Collection;
use Spatie\Permission\Traits\HasRoles;
use Tymon\JWTAuth\Contracts\JWTSubject;

/**
 * User Model
 * 
 * @property int $id
 * @property string $username
 * @property string $email
 * @property string $password
 * @property string $first_name
 * @property string $last_name
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $last_login_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * 
 * @package App\Models
 */
class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, HasRoles;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'users';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'first_name',
        'last_name',
        'phone',
        'avatar',
        'department_id',
        'team_id',
        'position',
        'bio',
        'timezone',
        'language',
        'status',
        'last_login_at',
        'last_login_ip',
        'mfa_enabled',
        'mfa_secret',
        'mfa_enabled_at',
        'mfa_backup_codes',
        'mfa_backup_codes_used'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'mfa_secret',
        'mfa_backup_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'mfa_enabled_at' => 'datetime',
            'password' => 'hashed',
            'mfa_enabled' => 'boolean',
            'mfa_backup_codes' => 'array',
            'mfa_backup_codes_used' => 'integer',
        ];
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'email' => $this->email,
            'username' => $this->username
        ];
    }

    /**
     * Get full name attribute
     *
     * @return string
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Check if user is active
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    // ==================== RBAC METHODS ====================

    /**
     * Get all roles assigned to the user
     *
     * @return BelongsToMany
     */
    public function roles(): BelongsToMany
    {
        return $this->morphToMany(
            Role::class,
            'model',
            'model_has_roles',
            'model_id',
            'role_id'
        );
    }

    /**
     * Get all permissions directly assigned to the user
     *
     * @return BelongsToMany
     */
    public function permissions(): BelongsToMany
    {
        return $this->morphToMany(
            Permission::class,
            'model',
            'model_has_permissions',
            'model_id',
            'permission_id'
        );
    }

    /**
     * Check if user has specific role
     *
     * @param string|array|Role $roles
     * @return bool
     */
    public function hasRole($roles): bool
    {
        if (is_string($roles)) {
            return $this->roles()->where('name', $roles)->exists();
        }

        if (is_array($roles)) {
            return $this->roles()->whereIn('name', $roles)->exists();
        }

        if ($roles instanceof Role) {
            return $this->roles()->where('id', $roles->id)->exists();
        }

        return false;
    }

    /**
     * Check if user has any of the given roles
     *
     * @param array $roles
     * @return bool
     */
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    /**
     * Check if user has all of the given roles
     *
     * @param array $roles
     * @return bool
     */
    public function hasAllRoles(array $roles): bool
    {
        foreach ($roles as $role) {
            if (!$this->hasRole($role)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if user has specific permission (directly or via role)
     *
     * @param string|Permission $permission
     * @return bool
     */
    public function hasPermission($permission): bool
    {
        if (is_string($permission)) {
            // Check direct permission
            if ($this->permissions()->where('name', $permission)->exists()) {
                return true;
            }

            // Check permission via roles
            return $this->hasPermissionViaRole($permission);
        }

        if ($permission instanceof Permission) {
            if ($this->permissions()->where('id', $permission->id)->exists()) {
                return true;
            }

            return $this->hasPermissionViaRole($permission->name);
        }

        return false;
    }

    /**
     * Check if user has permission via any assigned role
     *
     * @param string $permissionName
     * @return bool
     */
    protected function hasPermissionViaRole(string $permissionName): bool
    {
        foreach ($this->roles as $role) {
            if ($role->hasPermission($permissionName)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has any of the given permissions
     *
     * @param array $permissions
     * @return bool
     */
    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the given permissions
     *
     * @param array $permissions
     * @return bool
     */
    public function hasAllPermissions(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all permissions (direct + via roles)
     *
     * @return Collection
     */
    public function getAllPermissions(): Collection
    {
        $permissions = $this->permissions;

        foreach ($this->roles as $role) {
            $permissions = $permissions->merge($role->permissions);
        }

        return $permissions->unique('id');
    }

    /**
     * Assign role to user
     *
     * @param string|Role $role
     * @return void
     */
    public function assignRole($role): void
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        if (!$this->hasRole($role)) {
            $this->roles()->attach($role->id);
        }
    }

    /**
     * Remove role from user
     *
     * @param string|Role $role
     * @return void
     */
    public function removeRole($role): void
    {
        if (is_string($role)) {
            $role = Role::where('name', $role)->firstOrFail();
        }

        $this->roles()->detach($role->id);
    }

    /**
     * Sync roles for user (replace all existing)
     *
     * @param array $roles Array of role names or IDs
     * @return void
     */
    public function syncRoles(array $roles): void
    {
        $roleIds = [];

        foreach ($roles as $role) {
            if (is_string($role)) {
                $r = Role::where('name', $role)->first();
                if ($r) {
                    $roleIds[] = $r->id;
                }
            } elseif (is_numeric($role)) {
                $roleIds[] = $role;
            }
        }

        $this->roles()->sync($roleIds);
    }

    /**
     * Give permission directly to user
     *
     * @param string|Permission $permission
     * @return void
     */
    public function givePermissionTo($permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        if (!$this->permissions()->where('id', $permission->id)->exists()) {
            $this->permissions()->attach($permission->id);
        }
    }

    /**
     * Revoke direct permission from user
     *
     * @param string|Permission $permission
     * @return void
     */
    public function revokePermissionTo($permission): void
    {
        if (is_string($permission)) {
            $permission = Permission::where('name', $permission)->firstOrFail();
        }

        $this->permissions()->detach($permission->id);
    }

    /**
     * Check if user is super admin
     *
     * @return bool
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('Super Admin');
    }

    /**
     * Check if user is admin
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->hasAnyRole(['Super Admin', 'Admin']);
    }

    // ==================== DEPARTMENT & TEAM RELATIONSHIPS ====================

    /**
     * Get the department the user belongs to
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the team the user belongs to
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get departments managed by this user
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function managedDepartments()
    {
        return $this->hasMany(Department::class, 'manager_id');
    }

    /**
     * Get departments where this user is director
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function directedDepartments()
    {
        return $this->hasMany(Department::class, 'director_id');
    }

    /**
     * Get teams managed by this user
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function managedTeams()
    {
        return $this->hasMany(Team::class, 'manager_id');
    }

    // ==================== HIERARCHY & SCOPE CHECKING ====================

    /**
     * Get user's role level (1=highest, 5=lowest)
     * 
     * @return int
     */
    public function getRoleLevel(): int
    {
        if ($this->hasRole('superadmin')) return 1;
        if ($this->hasRole('director')) return 2;
        if ($this->hasRole('manager')) return 3;
        if ($this->hasRole('admin') || $this->hasRole('hr')) return 4;
        return 5; // user
    }

    /**
     * Check if user can approve another user's requests
     * 
     * @param User $targetUser
     * @return bool
     */
    public function canApprove(User $targetUser): bool
    {
        // Higher level (lower number) can approve
        return $this->getRoleLevel() < $targetUser->getRoleLevel();
    }

    /**
     * Check if user can manage another user
     * 
     * @param User $targetUser
     * @return bool
     */
    public function canManage(User $targetUser): bool
    {
        // Superadmin can manage everyone
        if ($this->hasRole('superadmin')) {
            return true;
        }

        // Same or lower level
        if ($this->getRoleLevel() > $targetUser->getRoleLevel()) {
            return false;
        }

        // Director can manage department members
        if ($this->hasRole('director')) {
            return $targetUser->department_id === $this->department_id;
        }

        // Manager can only manage team members
        if ($this->hasRole('manager')) {
            return $targetUser->team_id === $this->team_id;
        }

        return false;
    }

    /**
     * Check if user is in same team as another user
     * 
     * @param int $userId
     * @return bool
     */
    public function isInSameTeam(int $userId): bool
    {
        if (!$this->team_id) {
            return false;
        }

        $otherUser = static::find($userId);
        return $otherUser && $this->team_id === $otherUser->team_id;
    }

    /**
     * Check if user is in same department as another user
     * 
     * @param int $userId
     * @return bool
     */
    public function isInSameDepartment(int $userId): bool
    {
        if (!$this->department_id) {
            return false;
        }

        $otherUser = static::find($userId);
        return $otherUser && $this->department_id === $otherUser->department_id;
    }

    /**
     * Get all direct reports (team members managed by this user)
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function directReports()
    {
        if ($this->hasRole('manager') && $this->team_id) {
            return static::where('team_id', $this->team_id)
                ->where('id', '!=', $this->id)
                ->where('status', 'active')
                ->get();
        }

        if ($this->hasRole('director') && $this->department_id) {
            return static::where('department_id', $this->department_id)
                ->where('id', '!=', $this->id)
                ->where('status', 'active')
                ->get();
        }

        return collect();
    }

    /**
     * Get all department members
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function departmentMembers()
    {
        if (!$this->department_id) {
            return collect();
        }

        return static::where('department_id', $this->department_id)
            ->where('status', 'active')
            ->get();
    }

    /**
     * Get all team members
     * 
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function teamMembers()
    {
        if (!$this->team_id) {
            return collect();
        }

        return static::where('team_id', $this->team_id)
            ->where('status', 'active')
            ->get();
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if user is a manager
     * 
     * @return bool
     */
    public function isManager(): bool
    {
        return $this->hasRole('manager') || 
               $this->managedTeams()->exists() || 
               $this->managedDepartments()->exists();
    }

    /**
     * Check if user is a director
     * 
     * @return bool
     */
    public function isDirector(): bool
    {
        return $this->hasRole('director') || $this->directedDepartments()->exists();
    }

    /**
     * Check if user is HR
     * 
     * @return bool
     */
    public function isHR(): bool
    {
        return $this->hasRole('hr');
    }

    /**
     * Get user's full organizational path
     * 
     * @return string
     */
    public function getOrganizationalPath(): string
    {
        $parts = [];

        if ($this->department) {
            $parts[] = $this->department->full_path;
        }

        if ($this->team) {
            $parts[] = $this->team->name;
        }

        if ($this->position) {
            $parts[] = $this->position;
        }

        return implode(' > ', array_filter($parts));
    }
}
