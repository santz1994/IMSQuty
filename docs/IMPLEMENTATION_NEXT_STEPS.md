# 🚀 IMPLEMENTATION ROADMAP - NEXT STEPS
## **IMSQuty Production Readiness Plan**
## **Date**: January 8, 2026

---

## 📊 CURRENT STATUS SNAPSHOT

### ✅ **COMPLETED** (85% Overall)
- ✅ **10/10 Backend Services** (223 API Endpoints)
- ✅ **Frontend Core** (React + TypeScript, 0 errors)
- ✅ **RBAC Database Structure** (6 migrations created)
- ✅ **Authentication Service** (JWT + MFA + Username/Email login)
- ✅ **Documentation** (Organized + Clean)

### 🔄 **IN PROGRESS** (15% Remaining)
- 🔄 **RBAC Middleware & Route Protection**
- 🔄 **Role-Specific Dashboards**
- 🔄 **KPI Module**
- 🔄 **Import/Export Features**
- 🔄 **Audit Log Viewer**

---

## 🎯 IMMEDIATE NEXT STEPS (TODAY - 4 hours)

### ⏰ **Step 1: Run RBAC Migrations** (15 minutes)

```powershell
# Navigate to auth-service
cd d:\Project\ITQuty\imsquty\services\auth-service

# Run migrations
php artisan migrate

# Expected output:
# ✅ 2026_01_08_100000_create_roles_table ................... DONE
# ✅ 2026_01_08_100001_create_permissions_table ............ DONE
# ✅ 2026_01_08_100002_create_role_permissions_table ....... DONE
# ✅ 2026_01_08_100003_create_user_roles_table ............. DONE
# ✅ 2026_01_08_100004_create_departments_table ............ DONE
# ✅ 2026_01_08_100005_create_teams_table .................. DONE
```

**Verification**:
```sql
-- Check tables were created
SHOW TABLES LIKE '%roles%';
SHOW TABLES LIKE '%permissions%';
SHOW TABLES LIKE '%departments%';
SHOW TABLES LIKE '%teams%';
```

---

### ⏰ **Step 2: Seed RBAC Data** (20 minutes)

#### A. Check Existing Seeders
```powershell
cd d:\Project\ITQuty\imsquty\services\auth-service

# List seeders
ls database/seeders/

# Expected files:
# - RolesSeeder.php          ✅ Exists
# - PermissionsSeeder.php    ✅ Exists
# - DepartmentsSeeder.php    ✅ Exists
# - TeamsSeeder.php          ✅ Exists
# - RolePermissionSeeder.php ✅ Exists
# - TestUsersSeeder.php      ✅ Exists
```

#### B. Run Seeders in Order
```powershell
# 1. Seed roles (6 roles)
php artisan db:seed --class=RolesSeeder

# 2. Seed permissions (60+ permissions)
php artisan db:seed --class=PermissionsSeeder

# 3. Attach permissions to roles
php artisan db:seed --class=RolePermissionSeeder

# 4. Seed departments
php artisan db:seed --class=DepartmentsSeeder

# 5. Seed teams
php artisan db:seed --class=TeamsSeeder

# 6. Create test users for each role
php artisan db:seed --class=TestUsersSeeder
```

#### C. Verify Data
```sql
-- Check roles
SELECT id, name, slug, level FROM roles ORDER BY level;
-- Expected: 6 roles (superadmin=1, director=2, manager=3, admin=4, hr=5, user=6)

-- Check permissions count
SELECT COUNT(*) FROM permissions;
-- Expected: 60+ permissions

-- Check role-permission assignments
SELECT r.name, COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY r.level;

-- Check test users
SELECT u.username, u.email, r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE ur.is_primary = 1;
-- Expected: 6 users (one for each role)
```

---

### ⏰ **Step 3: Register Middleware** (15 minutes)

#### File: `imsquty/services/auth-service/app/Http/Kernel.php`

Check if middleware already registered:
```powershell
# Search for CheckRole in Kernel.php
Select-String -Path "app/Http/Kernel.php" -Pattern "CheckRole"
```

If NOT registered, add to `$middlewareAliases`:
```php
protected $middlewareAliases = [
    // ... existing middleware ...
    'auth' => \App\Http\Middleware\Authenticate::class,
    'role' => \App\Http\Middleware\CheckRole::class,              // ✅ ADD THIS
    'permission' => \App\Http\Middleware\CheckPermission::class,  // ✅ ADD THIS
];
```

**Verification**:
```powershell
# Check middleware files exist
Test-Path "app/Http/Middleware/CheckRole.php"
Test-Path "app/Http/Middleware/CheckPermission.php"
# Both should return: True
```

---

### ⏰ **Step 4: Protect API Routes** (45 minutes)

#### File: `imsquty/services/auth-service/routes/api.php`

Add route protection examples:

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;

// ====================================
// PUBLIC ROUTES (No authentication)
// ====================================
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
});

// ====================================
// AUTHENTICATED ROUTES
// ====================================
Route::middleware('auth:sanctum')->group(function () {
    
    // User profile (all authenticated users)
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    // ====================================
    // SUPERADMIN ONLY ROUTES
    // ====================================
    Route::middleware('role:superadmin')->prefix('admin')->group(function () {
        
        // Role management
        Route::apiResource('roles', RoleController::class);
        
        // Permission management
        Route::get('/permissions', [RoleController::class, 'permissions']);
        Route::post('/roles/{role}/permissions', [RoleController::class, 'assignPermissions']);
        
        // System settings
        Route::get('/system/settings', [SystemController::class, 'getSettings']);
        Route::put('/system/settings', [SystemController::class, 'updateSettings']);
        
        // Audit logs
        Route::get('/audit-logs', [AuditController::class, 'index']);
    });
    
    // ====================================
    // DIRECTOR ROUTES
    // ====================================
    Route::middleware('role:superadmin,director')->prefix('director')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'director']);
        Route::get('/reports/executive', [ReportController::class, 'executive']);
        Route::get('/analytics/company', [AnalyticsController::class, 'company']);
    });
    
    // ====================================
    // MANAGER ROUTES
    // ====================================
    Route::middleware('role:superadmin,director,manager')->prefix('manager')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'manager']);
        Route::get('/team', [TeamController::class, 'index']);
        Route::get('/team/performance', [TeamController::class, 'performance']);
        
        // Approvals (manager scope)
        Route::prefix('approvals')->group(function () {
            Route::get('/tickets', [ApprovalController::class, 'tickets'])
                ->middleware('permission:ticket.approve.department');
            Route::post('/tickets/{id}/approve', [ApprovalController::class, 'approveTicket'])
                ->middleware('permission:ticket.approve.department');
        });
    });
    
    // ====================================
    // ADMIN ROUTES
    // ====================================
    Route::middleware('role:superadmin,admin')->prefix('admin')->group(function () {
        // User management (admin scope)
        Route::middleware('permission:user.create.all')->group(function () {
            Route::post('/users', [UserController::class, 'store']);
        });
        
        Route::middleware('permission:user.update.all')->group(function () {
            Route::put('/users/{id}', [UserController::class, 'update']);
        });
        
        // Module management
        Route::get('/modules', [ModuleController::class, 'index']);
        Route::put('/modules/{id}/status', [ModuleController::class, 'updateStatus']);
    });
    
    // ====================================
    // HR ROUTES
    // ====================================
    Route::middleware('role:superadmin,hr')->prefix('hr')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'hr']);
        
        // Employee management
        Route::apiResource('employees', EmployeeController::class);
        
        // Leave management
        Route::get('/leaves', [LeaveController::class, 'index']);
        Route::post('/leaves/{id}/approve', [LeaveController::class, 'approve'])
            ->middleware('permission:leave.approve.all');
        
        // Recruitment
        Route::get('/recruitment', [RecruitmentController::class, 'index']);
        Route::post('/recruitment', [RecruitmentController::class, 'store']);
    });
    
    // ====================================
    // USER ROUTES (All authenticated users)
    // ====================================
    Route::prefix('user')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'user']);
        
        // Tickets (user scope)
        Route::get('/tickets', [TicketController::class, 'myTickets'])
            ->middleware('permission:ticket.view.own');
        Route::post('/tickets', [TicketController::class, 'store'])
            ->middleware('permission:ticket.create.own');
        
        // Assets (user scope)
        Route::get('/assets', [AssetController::class, 'myAssets'])
            ->middleware('permission:asset.view.own');
    });
});
```

**Test Routes**:
```powershell
# Test with Postman or curl
# 1. Login as superadmin
POST http://localhost:8001/api/auth/login
{
  "username": "superadmin",
  "password": "password123"
}

# 2. Use token to access protected route
GET http://localhost:8001/api/admin/roles
Authorization: Bearer {token}

# 3. Test permission denial
GET http://localhost:8001/api/admin/roles
Authorization: Bearer {user_token}
# Expected: 403 Forbidden
```

---

### ⏰ **Step 5: Test RBAC System** (60 minutes)

#### A. **Create Test Users** (if not seeded)
```bash
php artisan tinker
```

```php
// Create test users for each role
$roles = ['superadmin', 'director', 'manager', 'admin', 'hr', 'user'];

foreach ($roles as $roleName) {
    $user = \App\Models\User::create([
        'username' => $roleName,
        'email' => $roleName . '@quty.co.id',
        'password' => bcrypt('password123'),
        'first_name' => ucfirst($roleName),
        'last_name' => 'User',
        'status' => 'active',
    ]);
    
    $role = \App\Models\Role::where('slug', $roleName)->first();
    $user->roles()->attach($role->id, ['is_primary' => true]);
    
    echo "✅ Created: {$roleName}@quty.co.id\n";
}
```

#### B. **Test Login for Each Role**
```powershell
# Test script: test-rbac-login.ps1

$baseUrl = "http://localhost:8001/api"
$roles = @('superadmin', 'director', 'manager', 'admin', 'hr', 'user')

foreach ($role in $roles) {
    Write-Host "`n🔐 Testing login for: $role" -ForegroundColor Cyan
    
    $body = @{
        username = $role
        password = "password123"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
        Write-Host "✅ Login successful" -ForegroundColor Green
        Write-Host "   Token: $($response.access_token.Substring(0,20))..."
        Write-Host "   Role: $($response.user.role.name)"
    } catch {
        Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
```

#### C. **Test Permission Checks**
```php
// In tinker
$user = \App\Models\User::where('username', 'manager')->first();

// Test role check
$user->hasRole('manager');  // Should return true
$user->hasRole('superadmin');  // Should return false

// Test permission check
$user->hasPermission('ticket.approve.department');  // Should return true
$user->hasPermission('user.delete.all');  // Should return false

// Test hierarchy
$superadmin = \App\Models\User::where('username', 'superadmin')->first();
$manager->canApprove($superadmin);  // Should return false
$superadmin->canApprove($manager);  // Should return true
```

---

### ⏰ **Step 6: Update Frontend Dashboard Router** (45 minutes)

#### File: `imsquty/frontend/web-app/src/pages/RBACDashboard.tsx`

Verify role-based routing:
```typescript
const ROLE_DASHBOARDS: Record<string, React.ComponentType> = {
  superadmin: SuperAdminDashboard,  // ✅ Check component exists
  director: DirectorDashboard,      // ✅ Check component exists
  manager: ManagerDashboard,        // ✅ Check component exists
  admin: AdminDashboard,            // ⚠️ May need to create
  hr: HRDashboard,                  // ✅ Check component exists
  user: UserDashboard,              // ✅ Check component exists
}
```

**Create Missing Dashboard** (if needed):
```typescript
// File: src/pages/Admin/AdminDashboard.tsx
import React from 'react'
import { Box, Typography } from '@mui/material'

const AdminDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Admin Dashboard</Typography>
      {/* Add admin-specific widgets */}
    </Box>
  )
}

export default AdminDashboard
```

---

## 📅 PHASE 2: MISSING FEATURES (Tomorrow - 6 hours)

### **Feature 1: KPI Dashboard Module** (2 hours)

#### Create KPI Service
```php
// File: imsquty/services/reporting-service/app/Services/KPIService.php

class KPIService
{
    public function calculateSystemKPIs(): array
    {
        return [
            'asset_availability' => $this->calculateAssetAvailability(),
            'ticket_resolution_rate' => $this->calculateTicketResolutionRate(),
            'ticket_avg_response_time' => $this->calculateAvgResponseTime(),
            'ticket_sla_compliance' => $this->calculateSLACompliance(),
            'inventory_turnover' => $this->calculateInventoryTurnover(),
            'cost_per_asset' => $this->calculateCostPerAsset(),
            'user_satisfaction' => $this->calculateUserSatisfaction(),
        ];
    }
    
    private function calculateAssetAvailability(): float
    {
        // (Available assets / Total assets) * 100
    }
    
    private function calculateTicketResolutionRate(): float
    {
        // (Resolved tickets / Total tickets) * 100
    }
    
    // ... more KPI calculations
}
```

#### Frontend KPI Dashboard
```typescript
// File: src/pages/KPI/KPIDashboard.tsx
import React from 'react'
import { Grid, Card, CardContent, Typography } from '@mui/material'
import { useKPI } from '../../hooks/useKPI'

const KPIDashboard: React.FC = () => {
  const { kpis, loading } = useKPI(true)
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Asset Availability</Typography>
            <Typography variant="h3">{kpis?.asset_availability}%</Typography>
          </CardContent>
        </Card>
      </Grid>
      {/* More KPI cards */}
    </Grid>
  )
}
```

---

### **Feature 2: Import/Export Module** (2 hours)

#### Excel Import
```php
// File: imsquty/services/asset-service/app/Services/ImportService.php

use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportService
{
    public function importAssetsFromExcel(UploadedFile $file): array
    {
        $spreadsheet = IOFactory::load($file->getPathname());
        $worksheet = $spreadsheet->getActiveSheet();
        
        $imported = 0;
        $errors = [];
        
        foreach ($worksheet->getRowIterator(2) as $row) { // Skip header
            $cellIterator = $row->getCellIterator();
            $cellIterator->setIterateOnlyExistingCells(false);
            
            $data = [];
            foreach ($cellIterator as $cell) {
                $data[] = $cell->getValue();
            }
            
            try {
                Asset::create([
                    'name' => $data[0],
                    'serial_number' => $data[1],
                    'model' => $data[2],
                    // ... more fields
                ]);
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row {$row->getRowIndex()}: {$e->getMessage()}";
            }
        }
        
        return [
            'imported' => $imported,
            'errors' => $errors
        ];
    }
}
```

#### Frontend Import Component
```typescript
// File: src/components/Import/ExcelImporter.tsx
import React, { useState } from 'react'
import { Button, CircularProgress } from '@mui/material'
import { Upload } from '@mui/icons-material'

const ExcelImporter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  
  const handleImport = async () => {
    if (!file) return
    
    setImporting(true)
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch('/api/assets/import', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      alert(`Imported ${result.imported} assets`)
    } catch (error) {
      console.error(error)
    } finally {
      setImporting(false)
    }
  }
  
  return (
    <div>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button
        onClick={handleImport}
        disabled={!file || importing}
        startIcon={<Upload />}
      >
        {importing ? <CircularProgress size={20} /> : 'Import'}
      </Button>
    </div>
  )
}
```

---

### **Feature 3: Audit Log Viewer** (1 hour)

```typescript
// File: src/pages/AuditLogs/AuditLogViewer.tsx
import React from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { useAuditLogs } from '../../hooks/useAuditLogs'

const AuditLogViewer: React.FC = () => {
  const { logs, loading } = useAuditLogs(true)
  
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'user', headerName: 'User', width: 150 },
    { field: 'action', headerName: 'Action', width: 130 },
    { field: 'resource', headerName: 'Resource', width: 130 },
    { field: 'ip_address', headerName: 'IP Address', width: 130 },
    { field: 'created_at', headerName: 'Timestamp', width: 180 },
  ]
  
  return (
    <DataGrid
      rows={logs}
      columns={columns}
      loading={loading}
      pageSize={25}
      autoHeight
    />
  )
}
```

---

### **Feature 4: Email Domain Validation** (30 minutes)

#### Backend Validation Rule
```php
// File: imsquty/services/auth-service/app/Http/Requests/RegisterRequest.php

public function rules(): array
{
    return [
        'username' => 'required|string|max:50|unique:users',
        'email' => [
            'required',
            'string',
            'email',
            'max:255',
            'unique:users',
            'regex:/@quty\.co\.id$/'  // ✅ Only allow @quty.co.id
        ],
        'password' => 'required|string|min:8|confirmed',
    ];
}

public function messages(): array
{
    return [
        'email.regex' => 'Email must use @quty.co.id domain',
    ];
}
```

#### Frontend Validation
```typescript
// File: src/utils/validators.ts
export const validateQutyEmail = (email: string): boolean => {
  return email.endsWith('@quty.co.id')
}

export const getEmailError = (email: string): string | null => {
  if (!email) return 'Email is required'
  if (!validateQutyEmail(email)) {
    return 'Email must use @quty.co.id domain'
  }
  return null
}
```

---

## 📊 IMPLEMENTATION TIMELINE

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| **Today** | Run migrations | 15 min | ⏳ Ready |
| | Seed RBAC data | 20 min | ⏳ Ready |
| | Register middleware | 15 min | ⏳ Ready |
| | Protect API routes | 45 min | ⏳ Ready |
| | Test RBAC system | 60 min | ⏳ Ready |
| | Update frontend routing | 45 min | ⏳ Ready |
| **Tomorrow** | KPI Dashboard | 2 hours | 📋 Planned |
| | Import/Export | 2 hours | 📋 Planned |
| | Audit Log Viewer | 1 hour | 📋 Planned |
| | Email Validation | 30 min | 📋 Planned |
| | Global Search | 30 min | 📋 Planned |
| **Day 3** | Performance optimization | 1 hour | 📋 Planned |
| | Security hardening | 1 hour | 📋 Planned |
| | Final testing | 1 hour | 📋 Planned |
| | Production deployment | 30 min | 📋 Planned |

**Total**: ~12-15 hours over 3 days

---

## ✅ VERIFICATION CHECKLIST

### After RBAC Implementation:
- [ ] Migrations ran successfully (6 new tables)
- [ ] Seeders completed (6 roles, 60+ permissions)
- [ ] Middleware registered in Kernel.php
- [ ] API routes protected with role/permission
- [ ] Test users created for all roles
- [ ] Login works for all test users
- [ ] Permission checks work correctly
- [ ] Dashboard routing works for all roles
- [ ] Frontend shows correct UI per role

### After Feature Implementation:
- [ ] KPI calculations accurate
- [ ] Excel import/export working
- [ ] Audit logs displaying correctly
- [ ] Email validation enforcing @quty.co.id
- [ ] Global search functional

### Production Readiness:
- [ ] All tests passing
- [ ] Zero TypeScript errors
- [ ] No console errors
- [ ] Performance acceptable (< 500ms response)
- [ ] Security audit completed
- [ ] Documentation updated

---

## 🎯 SUCCESS CRITERIA

### Technical:
- ✅ RBAC fully functional
- ✅ All features implemented
- ✅ Zero errors in production
- ✅ Performance < 500ms average
- ✅ Security hardened

### Business:
- ✅ All 6 roles have appropriate access
- ✅ Users can perform daily tasks
- ✅ Admins can manage the system
- ✅ Directors can view analytics
- ✅ Audit trail complete

---

**Generated by**: Senior Developer Team  
**Last Updated**: January 8, 2026  
**Priority**: CRITICAL  
**Start**: Immediately  
**ETA**: 3 days to production
