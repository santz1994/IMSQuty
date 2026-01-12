# CORS & Authentication Fixes for System Settings Errors

## Problem Summary

```
Access to XMLHttpRequest at 'http://localhost:8000/api/v1/settings/...' 
from origin 'http://localhost:5174' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present

GET http://localhost:8000/api/v1/settings 401 (Unauthorized)
```

**Root Causes:**
1. CORS headers not being forwarded through API Gateway to backend services
2. Settings endpoints require admin/superadmin permission
3. Token might not be properly validated

---

## Solution Part 1: Verify API Gateway CORS

**File:** `api-gateway/server.js` ✅ (Already configured)

The API Gateway has CORS properly configured:
```javascript
const allowedOrigins = [
  'http://localhost:5173',  // web-app
  'http://localhost:5174',  // admin-panel
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
}));
```

✅ **Status:** CONFIGURED CORRECTLY

---

## Solution Part 2: Backend CORS Headers

Each backend service must also return CORS headers. Check if your services have CORS middleware:

### For Laravel Services (services/*/):

**File:** `services/rbac-service/app/Http/Kernel.php`

Ensure CORS middleware is registered:

```php
protected $middleware = [
    // ... other middleware
    \App\Http\Middleware\Cors::class,
];

// OR in $middlewareGroups:
'api' => [
    // ... other middleware
    \App\Http\Middleware\Cors::class,
],
```

**File:** `services/*/app/Http/Middleware/Cors.php`

Create or verify this middleware exists:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    public function handle(Request $request, Closure $next)
    {
        // Handle preflight requests
        if ($request->getMethod() === "OPTIONS") {
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
            header('Access-Control-Allow-Credentials: true');
            header('Access-Control-Max-Age: 86400');
            return response('', 200);
        }

        $response = $next($request);

        // Add CORS headers to response
        $response->header('Access-Control-Allow-Origin', $request->header('Origin') ?: '*');
        $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        $response->header('Access-Control-Allow-Credentials', 'true');
        $response->header('Access-Control-Max-Age', '86400');

        return $response;
    }
}
```

---

## Solution Part 3: Fix 401 Unauthorized

The 401 error means the settings endpoint requires authentication but:
1. Token is not being sent OR
2. Token is invalid/expired OR
3. User doesn't have permission

### Check Frontend Token Handling

**File:** `frontend/admin-panel/src/api/apiClient.ts`

Verify token is attached:

```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
})

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Token attached to request:', token.substring(0, 20) + '...')
    } else {
      console.warn('No token found in storage!')
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Token expired or invalid')
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

### Add Settings Permissions

**File:** `services/rbac-service/database/seeders/PermissionsSeeder.php`

Ensure settings permissions exist:

```php
public function run()
{
    // Settings module permissions
    Permission::firstOrCreate(
        ['name' => 'settings.view'],
        [
            'display_name' => 'View System Settings',
            'description' => 'View application settings',
            'module' => 'settings'
        ]
    );

    Permission::firstOrCreate(
        ['name' => 'settings.update'],
        [
            'display_name' => 'Update System Settings',
            'description' => 'Modify system settings',
            'module' => 'settings'
        ]
    );

    Permission::firstOrCreate(
        ['name' => 'settings.cache.manage'],
        [
            'display_name' => 'Manage Cache',
            'description' => 'Clear and manage application cache',
            'module' => 'settings'
        ]
    );

    Permission::firstOrCreate(
        ['name' => 'settings.queue.view'],
        [
            'display_name' => 'View Queue Statistics',
            'description' => 'View job queue statistics',
            'module' => 'settings'
        ]
    );
}
```

**File:** `services/rbac-service/database/seeders/RolePermissionSeeder.php`

Assign permissions to admin role:

```php
public function run()
{
    $admin = Role::where('name', 'admin')->first();
    $superAdmin = Role::where('name', 'superadmin')->first();

    if ($admin) {
        $admin->permissions()->syncWithoutDetaching([
            'settings.view',
            'settings.update',
            'settings.cache.manage',
            'settings.queue.view'
        ]);
    }

    if ($superAdmin) {
        // Superadmin already has all permissions
        $superAdmin->permissions()->syncWithoutDetaching([
            'settings.view',
            'settings.update',
            'settings.cache.manage',
            'settings.queue.view'
        ]);
    }
}
```

---

## Solution Part 4: Backend Settings Endpoint

**File:** `services/*/app/Http/Controllers/SettingsController.php`

Verify endpoint checks permissions:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SettingsController extends Controller
{
    // Settings endpoint should authorize before returning data
    public function getAllSettings(Request $request)
    {
        // Check if user has permission
        if (!auth()->user()->can('settings.view')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - settings.view permission required'
            ], 403);
        }

        $settings = \App\Models\Setting::all();

        return response()->json([
            'success' => true,
            'data' => $settings,
            'meta' => [
                'count' => count($settings)
            ]
        ]);
    }

    public function getCacheStats(Request $request)
    {
        if (!auth()->user()->can('settings.cache.manage')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - settings.cache.manage permission required'
            ], 403);
        }

        try {
            $stats = [
                'total_keys' => 0,
                'memory_usage' => 0,
                'hit_rate' => 0
            ];

            // Get actual stats if Redis is available
            if (class_exists('\Redis')) {
                // Implementation for Redis stats
            }

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cache stats: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getQueueStats(Request $request)
    {
        if (!auth()->user()->can('settings.queue.view')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized - settings.queue.view permission required'
            ], 403);
        }

        try {
            $stats = [
                'pending_jobs' => 0,
                'failed_jobs' => 0
            ];

            // Query the jobs table
            if (\Schema::hasTable('jobs')) {
                $stats['pending_jobs'] = \DB::table('jobs')->count();
            }

            if (\Schema::hasTable('failed_jobs')) {
                $stats['failed_jobs'] = \DB::table('failed_jobs')->count();
            }

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve queue stats: ' . $e->getMessage()
            ], 500);
        }
    }
}
```

---

## Testing Checklist

- [ ] Run SQL migration to create jobs table: `d:\Project\ITQuty\imsquty\database\fixes\create_queue_tables.sql`
- [ ] Login to admin panel (token should be stored)
- [ ] Open browser DevTools (F12) → Network tab
- [ ] Go to System Settings page
- [ ] Verify requests show:
  - [ ] `Authorization: Bearer <token>` header
  - [ ] `Access-Control-Allow-Origin: http://localhost:5174` header
  - [ ] 200 OK status (not 401 or CORS error)
- [ ] Verify cache/queue stats display without errors
- [ ] Test with Firefox and Chrome

---

## Debugging Commands

```bash
# Test CORS directly
curl -H "Origin: http://localhost:5174" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS \
     http://localhost:8000/api/v1/settings/cache/stats -v

# Check token
# In browser console:
console.log(localStorage.getItem('token'))

# Test settings endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/v1/settings -v

# Check if jobs table exists
mysql -u root -p imsquty -e "SELECT * FROM jobs LIMIT 1;"
```

---

## Quick Fixes Summary

| Issue | Fix | File |
|-------|-----|------|
| Jobs table not found | Run SQL script | `create_queue_tables.sql` |
| 401 Unauthorized | Ensure token attached | `apiClient.ts` |
| CORS headers missing | Add CORS middleware | `app/Http/Middleware/Cors.php` |
| Settings permissions missing | Run seeder | `PermissionsSeeder.php` |
| Backend doesn't check perms | Add authorization check | `SettingsController.php` |

---

**Document Status:** ✅ COMPLETE  
**Last Updated:** January 12, 2026
