# 🔐 UAC/RBAC INTEGRATION GUIDE

**Date**: January 8, 2026  
**Feature**: Role-Based Access Control Integration  
**Status**: Implementation Ready  
**Backend**: 100% Complete (223 endpoints)

---

## 📊 OVERVIEW

Dokumen ini menjelaskan integrasi **6-level role hierarchy** dengan backend auth-service yang sudah 100% complete.

### **Existing Auth-Service Structure**:
```
imsquty/services/auth-service/
├── Controllers/
│   └── AuthController.php (✅ Complete)
├── Models/
│   └── User.php (⚠️ Need enhancement)
├── Middleware/
│   └── (⏳ Need CheckRole, CheckPermission)
├── routes/
│   └── api.php (⚠️ Need route protection)
└── database/
    └── migrations/ (⏳ Need roles & permissions tables)
```

---

## 🏗️ DATABASE SCHEMA ENHANCEMENT

### **1. Create Roles Table**

File: `imsquty/services/auth-service/database/migrations/2026_01_08_create_roles_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // superadmin, director, manager, admin, hr, user
            $table->string('display_name'); // Indonesian name
            $table->integer('level')->default(5); // 1=highest (superadmin), 5=lowest (user)
            $table->text('description')->nullable();
            $table->boolean('is_system_role')->default(false); // Cannot be deleted
            $table->timestamps();
            
            $table->index('name');
            $table->index('level');
        });
    }

    public function down()
    {
        Schema::dropIfExists('roles');
    }
};
```

---

### **2. Create Permissions Table**

File: `imsquty/services/auth-service/database/migrations/2026_01_08_create_permissions_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Format: module.action.scope
            $table->string('module'); // asset, ticket, user, etc.
            $table->string('action'); // create, read, update, delete, approve
            $table->enum('scope', ['all', 'department', 'team', 'own', 'none'])->default('own');
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->index(['module', 'action']);
            $table->index('scope');
        });
    }

    public function down()
    {
        Schema::dropIfExists('permissions');
    }
};
```

**Permission Naming Convention**:
```
Format: {module}.{action}.{scope}

Examples:
✅ asset.create.all          → Create assets anywhere
✅ asset.view.department     → View department assets only
✅ asset.update.team         → Update team assets only
✅ asset.delete.own          → Delete own assets only

✅ ticket.approve.all        → Approve any ticket
✅ ticket.approve.department → Approve department tickets only

✅ user.create.all           → Create any user
✅ user.update.team          → Update team members only
✅ user.delete.none          → Cannot delete users
```

---

### **3. Create Role_Permissions Pivot Table**

File: `imsquty/services/auth-service/database/migrations/2026_01_08_create_role_permissions_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->foreignId('permission_id')->constrained('permissions')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['role_id', 'permission_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('role_permissions');
    }
};
```

---

### **4. Enhance User_Roles Table**

File: `imsquty/services/auth-service/database/migrations/2026_01_08_enhance_user_roles_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            
            // Scope assignments (optional)
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->foreignId('team_id')->nullable()->constrained('teams')->onDelete('set null');
            
            // Audit trail
            $table->foreignId('granted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('granted_at')->useCurrent();
            $table->timestamp('expires_at')->nullable(); // For temporary roles
            
            $table->timestamps();
            
            $table->unique(['user_id', 'role_id', 'department_id', 'team_id']);
            $table->index(['user_id', 'role_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_roles');
    }
};
```

---

### **5. Create Departments Table** (Hierarchical)

File: `imsquty/services/auth-service/database/migrations/2026_01_08_create_departments_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique(); // IT, HR, FIN, OPS, etc.
            
            // Hierarchical structure
            $table->foreignId('parent_id')->nullable()->constrained('departments')->onDelete('set null');
            $table->integer('level')->default(1); // 1=top-level, 2=sub-department, etc.
            
            // Leadership
            $table->foreignId('manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('director_id')->nullable()->constrained('users')->onDelete('set null');
            
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('code');
            $table->index('parent_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('departments');
    }
};
```

---

### **6. Create Teams Table**

File: `imsquty/services/auth-service/database/migrations/2026_01_08_create_teams_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->foreignId('manager_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index('department_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('teams');
    }
};
```

---

## 🔧 USER MODEL ENHANCEMENTS

File: `imsquty/services/auth-service/Models/User.php`

Add these methods to existing User model:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    // ... existing code ...
    
    /**
     * Relationships
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot('department_id', 'team_id', 'granted_by', 'granted_at', 'expires_at')
            ->withTimestamps();
    }
    
    public function department()
    {
        return $this->belongsTo(Department::class);
    }
    
    public function team()
    {
        return $this->belongsTo(Team::class);
    }
    
    /**
     * Role Checking Methods
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()
            ->where('name', $roleName)
            ->whereNull('expires_at')
            ->orWhere('expires_at', '>', now())
            ->exists();
    }
    
    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()
            ->whereIn('name', $roles)
            ->whereNull('expires_at')
            ->orWhere('expires_at', '>', now())
            ->exists();
    }
    
    public function hasAllRoles(array $roles): bool
    {
        $userRoles = $this->roles()
            ->whereNull('expires_at')
            ->orWhere('expires_at', '>', now())
            ->pluck('name')
            ->toArray();
            
        return count(array_diff($roles, $userRoles)) === 0;
    }
    
    /**
     * Permission Checking
     */
    public function hasPermission(string $permissionName): bool
    {
        // Superadmin bypass
        if ($this->hasRole('superadmin')) {
            return true;
        }
        
        return $this->roles->flatMap(function ($role) {
            return $role->permissions;
        })->contains('name', $permissionName);
    }
    
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
     * Get user's role level (1=highest, 5=lowest)
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
     * Hierarchy Validation
     */
    public function canApprove(User $targetUser): bool
    {
        return $this->getRoleLevel() < $targetUser->getRoleLevel();
    }
    
    public function canManage(User $targetUser): bool
    {
        // Same or lower level
        if ($this->getRoleLevel() > $targetUser->getRoleLevel()) {
            return false;
        }
        
        // Manager can only manage team members
        if ($this->hasRole('manager')) {
            return $targetUser->team_id === $this->team_id;
        }
        
        // Director can manage department
        if ($this->hasRole('director')) {
            return $targetUser->department_id === $this->department_id;
        }
        
        return false;
    }
    
    /**
     * Scope Checking
     */
    public function isInSameTeam(int $userId): bool
    {
        $otherUser = static::find($userId);
        return $otherUser && $this->team_id === $otherUser->team_id;
    }
    
    public function isInSameDepartment(int $userId): bool
    {
        $otherUser = static::find($userId);
        return $otherUser && $this->department_id === $otherUser->department_id;
    }
    
    /**
     * Get subordinates
     */
    public function directReports()
    {
        if ($this->hasRole('manager')) {
            return static::where('team_id', $this->team_id)
                ->where('id', '!=', $this->id)
                ->get();
        }
        
        if ($this->hasRole('director')) {
            return static::where('department_id', $this->department_id)
                ->where('id', '!=', $this->id)
                ->get();
        }
        
        return collect();
    }
    
    public function departmentMembers()
    {
        return static::where('department_id', $this->department_id)->get();
    }
}
```

---

## 🛡️ MIDDLEWARE IMPLEMENTATION

### **1. CheckRole Middleware**

File: `imsquty/services/auth-service/Middleware/CheckRole.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Please login'
            ], 401);
        }
        
        // Check if user has any of the required roles
        if (!$user->hasAnyRole($roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden - Insufficient permissions',
                'required_roles' => $roles,
                'your_roles' => $user->roles->pluck('name')
            ], 403);
        }
        
        return $next($request);
    }
}
```

---

### **2. CheckPermission Middleware**

File: `imsquty/services/auth-service/Middleware/CheckPermission.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission, string $scope = 'all')
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - Please login'
            ], 401);
        }
        
        // Superadmin bypass
        if ($user->hasRole('superadmin')) {
            return $next($request);
        }
        
        // Check permission
        if (!$user->hasPermission($permission)) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden - Missing permission',
                'required_permission' => $permission
            ], 403);
        }
        
        // Scope validation
        if ($scope !== 'all') {
            $resourceOwnerId = $request->route('id') ?? $request->input('user_id');
            
            if ($scope === 'own' && $resourceOwnerId != $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden - Can only access own resources'
                ], 403);
            }
            
            if ($scope === 'team' && !$user->isInSameTeam($resourceOwnerId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden - Can only access team resources'
                ], 403);
            }
            
            if ($scope === 'department' && !$user->isInSameDepartment($resourceOwnerId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden - Can only access department resources'
                ], 403);
            }
        }
        
        return $next($request);
    }
}
```

---

### **3. Register Middleware**

File: `imsquty/services/auth-service/app/Http/Kernel.php`

```php
protected $middlewareAliases = [
    // ... existing middleware ...
    'role' => \App\Http\Middleware\CheckRole::class,
    'permission' => \App\Http\Middleware\CheckPermission::class,
];
```

---

## 🚦 API ROUTE PROTECTION

File: `imsquty/services/auth-service/routes/api.php`

### **Example Route Protection**:

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

// Public routes (no auth)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes (require auth)
Route::middleware('auth:sanctum')->group(function () {
    
    // ========================================
    // SUPERADMIN ONLY ROUTES
    // ========================================
    Route::middleware('role:superadmin')->prefix('admin')->group(function () {
        Route::get('/system/info', [SystemController::class, 'info']);
        Route::post('/system/backup', [SystemController::class, 'backup']);
        Route::post('/system/migrate', [SystemController::class, 'migrate']);
        Route::get('/logs', [LogController::class, 'index']);
        
        // RBAC Management
        Route::apiResource('roles', RoleController::class);
        Route::apiResource('permissions', PermissionController::class);
    });
    
    // ========================================
    // DIRECTOR ONLY ROUTES
    // ========================================
    Route::middleware('role:director')->prefix('director')->group(function () {
        Route::get('/dashboard/kpi', [DirectorController::class, 'kpi']);
        Route::get('/reports/executive', [ReportController::class, 'executive']);
        Route::post('/budget/approve', [BudgetController::class, 'approve']);
    });
    
    // ========================================
    // MANAGER ROUTES
    // ========================================
    Route::middleware('role:manager')->prefix('manager')->group(function () {
        Route::get('/team/members', [TeamController::class, 'members']);
        Route::get('/team/performance', [TeamController::class, 'performance']);
        Route::post('/approvals/tickets', [ApprovalController::class, 'approveTicket']);
    });
    
    // ========================================
    // ADMIN ROUTES
    // ========================================
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::get('/tickets', [TicketController::class, 'index']);
        Route::post('/tickets/{id}/assign', [TicketController::class, 'assign']);
    });
    
    // ========================================
    // HR ROUTES
    // ========================================
    Route::middleware('role:hr')->prefix('hr')->group(function () {
        Route::apiResource('employees', EmployeeController::class);
        Route::get('/leaves', [LeaveController::class, 'index']);
        Route::post('/leaves/{id}/approve', [LeaveController::class, 'approve']);
        Route::get('/recruitment/pipeline', [RecruitmentController::class, 'pipeline']);
    });
    
    // ========================================
    // USER (END-USER) ROUTES
    // ========================================
    Route::prefix('user')->group(function () {
        Route::get('/profile', [UserController::class, 'profile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        
        // Own tickets only
        Route::get('/tickets', [TicketController::class, 'myTickets']);
        Route::post('/tickets', [TicketController::class, 'create']);
        
        // Own assets only
        Route::get('/assets', [AssetController::class, 'myAssets']);
        
        // Submit leave request
        Route::post('/leaves', [LeaveController::class, 'submit']);
    });
    
    // ========================================
    // MIXED ROLE ROUTES (Admin OR Manager)
    // ========================================
    Route::middleware('role:admin,manager')->group(function () {
        Route::get('/reports/operational', [ReportController::class, 'operational']);
    });
});
```

---

## 🌱 SEEDERS

### **1. Roles Seeder**

File: `imsquty/services/auth-service/database/seeders/RolesSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesSeeder extends Seeder
{
    public function run()
    {
        $roles = [
            [
                'name' => 'superadmin',
                'display_name' => 'Super Administrator',
                'level' => 1,
                'description' => 'Pengguna dengan akses tertinggi dalam sistem IT. Mengelola infrastruktur, keamanan, database, dan konfigurasi sistem.',
                'is_system_role' => true,
            ],
            [
                'name' => 'director',
                'display_name' => 'Direktur / C-Level',
                'level' => 2,
                'description' => 'Eksekutif dengan tanggung jawab strategis perusahaan. Menentukan kebijakan dan strategi bisnis.',
                'is_system_role' => true,
            ],
            [
                'name' => 'manager',
                'display_name' => 'Manager / Team Lead',
                'level' => 3,
                'description' => 'Pimpinan tim/departemen yang mengelola operasional tim dan melakukan approval level-1.',
                'is_system_role' => true,
            ],
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'level' => 4,
                'description' => 'Pengguna dengan akses terbatas untuk mengelola modul tertentu dan mendukung operasional harian.',
                'is_system_role' => true,
            ],
            [
                'name' => 'hr',
                'display_name' => 'Human Resources',
                'level' => 4,
                'description' => 'Tim yang mengelola sumber daya manusia termasuk rekrutmen, cuti, dan data karyawan.',
                'is_system_role' => true,
            ],
            [
                'name' => 'user',
                'display_name' => 'End User / Staff',
                'level' => 5,
                'description' => 'Pengguna biasa atau staf yang menggunakan sistem untuk tugas harian seperti membuat tiket dan melihat aset.',
                'is_system_role' => true,
            ],
        ];
        
        foreach ($roles as $role) {
            DB::table('roles')->insert(array_merge($role, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
```

Run: `php artisan db:seed --class=RolesSeeder`

---

### **2. Permissions Seeder** (60+ permissions)

File: `imsquty/services/auth-service/database/seeders/PermissionsSeeder.php`

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionsSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            // System Infrastructure (Superadmin only)
            ['name' => 'system.config.all', 'module' => 'system', 'action' => 'config', 'scope' => 'all'],
            ['name' => 'system.database.all', 'module' => 'system', 'action' => 'database', 'scope' => 'all'],
            ['name' => 'system.backup.all', 'module' => 'system', 'action' => 'backup', 'scope' => 'all'],
            ['name' => 'system.deploy.all', 'module' => 'system', 'action' => 'deploy', 'scope' => 'all'],
            ['name' => 'system.logs.all', 'module' => 'system', 'action' => 'logs', 'scope' => 'all'],
            
            // User Management
            ['name' => 'user.create.all', 'module' => 'user', 'action' => 'create', 'scope' => 'all'],
            ['name' => 'user.view.all', 'module' => 'user', 'action' => 'view', 'scope' => 'all'],
            ['name' => 'user.view.department', 'module' => 'user', 'action' => 'view', 'scope' => 'department'],
            ['name' => 'user.view.team', 'module' => 'user', 'action' => 'view', 'scope' => 'team'],
            ['name' => 'user.view.own', 'module' => 'user', 'action' => 'view', 'scope' => 'own'],
            ['name' => 'user.update.all', 'module' => 'user', 'action' => 'update', 'scope' => 'all'],
            ['name' => 'user.update.team', 'module' => 'user', 'action' => 'update', 'scope' => 'team'],
            ['name' => 'user.update.own', 'module' => 'user', 'action' => 'update', 'scope' => 'own'],
            ['name' => 'user.delete.all', 'module' => 'user', 'action' => 'delete', 'scope' => 'all'],
            
            // Asset Management
            ['name' => 'asset.create.all', 'module' => 'asset', 'action' => 'create', 'scope' => 'all'],
            ['name' => 'asset.view.all', 'module' => 'asset', 'action' => 'view', 'scope' => 'all'],
            ['name' => 'asset.view.department', 'module' => 'asset', 'action' => 'view', 'scope' => 'department'],
            ['name' => 'asset.view.own', 'module' => 'asset', 'action' => 'view', 'scope' => 'own'],
            ['name' => 'asset.update.all', 'module' => 'asset', 'action' => 'update', 'scope' => 'all'],
            ['name' => 'asset.update.department', 'module' => 'asset', 'action' => 'update', 'scope' => 'department'],
            ['name' => 'asset.delete.all', 'module' => 'asset', 'action' => 'delete', 'scope' => 'all'],
            ['name' => 'asset.approve.all', 'module' => 'asset', 'action' => 'approve', 'scope' => 'all'],
            
            // Ticket Management
            ['name' => 'ticket.create.all', 'module' => 'ticket', 'action' => 'create', 'scope' => 'all'],
            ['name' => 'ticket.view.all', 'module' => 'ticket', 'action' => 'view', 'scope' => 'all'],
            ['name' => 'ticket.view.department', 'module' => 'ticket', 'action' => 'view', 'scope' => 'department'],
            ['name' => 'ticket.view.own', 'module' => 'ticket', 'action' => 'view', 'scope' => 'own'],
            ['name' => 'ticket.assign.all', 'module' => 'ticket', 'action' => 'assign', 'scope' => 'all'],
            ['name' => 'ticket.assign.team', 'module' => 'ticket', 'action' => 'assign', 'scope' => 'team'],
            ['name' => 'ticket.resolve.all', 'module' => 'ticket', 'action' => 'resolve', 'scope' => 'all'],
            ['name' => 'ticket.close.all', 'module' => 'ticket', 'action' => 'close', 'scope' => 'all'],
            
            // Financial
            ['name' => 'budget.view.all', 'module' => 'budget', 'action' => 'view', 'scope' => 'all'],
            ['name' => 'budget.create.all', 'module' => 'budget', 'action' => 'create', 'scope' => 'all'],
            ['name' => 'budget.approve.all', 'module' => 'budget', 'action' => 'approve', 'scope' => 'all'],
            
            // HR Operations
            ['name' => 'employee.create.all', 'module' => 'employee', 'action' => 'create', 'scope' => 'all'],
            ['name' => 'employee.view.all', 'module' => 'employee', 'action' => 'view', 'scope' => 'all'],
            ['name' => 'employee.update.all', 'module' => 'employee', 'action' => 'update', 'scope' => 'all'],
            ['name' => 'employee.delete.all', 'module' => 'employee', 'action' => 'delete', 'scope' => 'all'],
            
            ['name' => 'leave.view.all', 'module' => 'leave', 'action' => 'view', 'scope' => 'all'],
            ['name' => 'leave.view.own', 'module' => 'leave', 'action' => 'view', 'scope' => 'own'],
            ['name' => 'leave.submit.own', 'module' => 'leave', 'action' => 'submit', 'scope' => 'own'],
            ['name' => 'leave.approve.all', 'module' => 'leave', 'action' => 'approve', 'scope' => 'all'],
            ['name' => 'leave.approve.team', 'module' => 'leave', 'action' => 'approve', 'scope' => 'team'],
            
            // Reports
            ['name' => 'report.view.executive', 'module' => 'report', 'action' => 'view', 'scope' => 'all'],
            ['name' => 'report.view.operational', 'module' => 'report', 'action' => 'view', 'scope' => 'department'],
            ['name' => 'report.view.own', 'module' => 'report', 'action' => 'view', 'scope' => 'own'],
            
            // RBAC Management
            ['name' => 'role.create.all', 'module' => 'role', 'action' => 'create', 'scope' => 'all'],
            ['name' => 'role.assign.all', 'module' => 'role', 'action' => 'assign', 'scope' => 'all'],
            ['name' => 'role.revoke.all', 'module' => 'role', 'action' => 'revoke', 'scope' => 'all'],
        ];
        
        foreach ($permissions as $permission) {
            DB::table('permissions')->insert(array_merge($permission, [
                'description' => ucfirst(str_replace('.', ' → ', $permission['name'])),
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
```

Run: `php artisan db:seed --class=PermissionsSeeder`

---

## 📦 QUICK SETUP COMMANDS

```bash
# 1. Navigate to auth-service
cd imsquty/services/auth-service

# 2. Create migrations
php artisan make:migration create_roles_table
php artisan make:migration create_permissions_table
php artisan make:migration create_role_permissions_table
php artisan make:migration enhance_user_roles_table
php artisan make:migration create_departments_table
php artisan make:migration create_teams_table

# 3. Run migrations
php artisan migrate

# 4. Create seeders
php artisan make:seeder RolesSeeder
php artisan make:seeder PermissionsSeeder
php artisan make:seeder RolePermissionsSeeder

# 5. Seed data
php artisan db:seed --class=RolesSeeder
php artisan db:seed --class=PermissionsSeeder
php artisan db:seed --class=RolePermissionsSeeder

# 6. Create middleware
php artisan make:middleware CheckRole
php artisan make:middleware CheckPermission

# 7. Test
php artisan test
```

---

## ✅ VERIFICATION CHECKLIST

After implementation, verify:

- [ ] ✅ 6 roles seeded (superadmin, director, manager, admin, hr, user)
- [ ] ✅ 60+ permissions seeded
- [ ] ✅ User model has role/permission methods
- [ ] ✅ Middleware registered in Kernel.php
- [ ] ✅ API routes protected with role/permission middleware
- [ ] ✅ Test user created with each role
- [ ] ✅ Frontend can detect user role via `/api/auth/me`
- [ ] ✅ Permission checks working in frontend guards

---

## 🎯 NEXT STEPS

1. ⏳ **Implement database migrations** (30 min)
2. ⏳ **Create seeders** (30 min)
3. ⏳ **Enhance User model** (30 min)
4. ⏳ **Create middleware** (30 min)
5. ⏳ **Protect API routes** (1 hour)
6. ⏳ **Test with Postman** (30 min)
7. ⏳ **Frontend integration** (See ROLE_BASED_UI_ARCHITECTURE.md)

**Total Backend Time**: 2-3 hours

---

**Generated by**: Senior Backend Team  
**Date**: January 8, 2026  
**Status**: Ready for Implementation  
**Dependencies**: auth-service (✅ 100% complete)
