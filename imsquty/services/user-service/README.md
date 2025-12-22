# User Service API Documentation

**Service:** User Management Microservice  
**Port:** 8002  
**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Test Coverage:** 43 tests passing (20 feature + 21 unit + 2 examples)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [RBAC (Role-Based Access Control)](#rbac-role-based-access-control)
- [Authentication](#authentication)
- [Request/Response Examples](#requestresponse-examples)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The User Service handles all user management operations including:

- ✅ User CRUD operations (Create, Read, Update, Delete)
- ✅ Role-Based Access Control (RBAC) with 8 predefined roles
- ✅ User authentication integration with Auth Service
- ✅ Soft delete support for GDPR compliance
- ✅ Comprehensive audit logging for all CUD operations
- ✅ Division/department management
- ✅ Permission management per user and role
- ✅ Search and filtering capabilities
- ✅ Pagination support (15 items per page default)

### Architecture

```
UserController → UserService → UserRepository → User Model
                      ↓
                 AuditLog (automatic)
```

**Pattern:** Service-Repository Pattern  
**Validation:** Form Requests (CreateUserRequest, UpdateUserRequest)  
**Response:** API Resources (UserResource)  
**Security:** JWT Authentication (Laravel Sanctum)

---

## 🚀 Installation

### 1. Clone and Navigate

```bash
cd D:\Project\ITQuty\itquty-microservices\services\user-service
```

### 2. Install Dependencies

```bash
composer install
```

### 3. Copy Environment File

```bash
cp .env.example .env
```

### 4. Generate Application Key

```bash
php artisan key:generate
```

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Application
APP_NAME="User Service"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8002

# Database (Shared with all services)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=imstest_quty
DB_USERNAME=root
DB_PASSWORD=

# Sanctum Authentication
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:8000

# Service Configuration
SERVICE_PORT=8002
SERVICE_NAME=user-service

# Auth Service Integration
AUTH_SERVICE_URL=http://localhost:8001
```

---

## 🗄️ Database Setup

### Run Migrations

```bash
# Fresh migration (drops all tables)
php artisan migrate:fresh

# Regular migration
php artisan migrate
```

### Seed Default Roles and Permissions

```bash
php artisan db:seed --class=RoleSeeder
```

**Output:**
```
✅ Roles and permissions seeded successfully!

+--------------+-------------------+
| Role         | Permissions Count |
+--------------+-------------------+
| Super Admin  | 18 (ALL)          |
| Admin        | 13                |
| Management   | 8                 |
| Director     | 5                 |
| Manager      | 4                 |
| Receptionist | 2                 |
| Technician   | 1                 |
| User         | 1                 |
+--------------+-------------------+
```

### Database Schema

**Tables:**
- `users` - User accounts with extended fields
- `divisions` - Organizational structure
- `audit_logs` - Audit trail for all operations (polymorphic)
- `roles` - RBAC roles (Spatie Permission)
- `permissions` - RBAC permissions (Spatie Permission)
- `model_has_roles` - User-Role assignments
- `model_has_permissions` - User-Permission assignments
- `role_has_permissions` - Role-Permission assignments

**User Table Fields:**
```sql
- id (primary key)
- username (unique)
- email (unique)
- email_verified_at
- password (bcrypt hashed)
- first_name
- last_name
- name (nullable, legacy)
- phone
- division_id (FK to divisions)
- status (enum: active, inactive, suspended)
- last_login
- remember_token
- deleted_at (soft deletes)
- created_at
- updated_at
```

---

## 📡 API Endpoints

### Base URL

```
http://localhost:8002/api/v1
```

### Health Check

**Endpoint:** `GET /health`  
**Authentication:** ❌ Not required

**Response:**
```json
{
  "success": true,
  "service": "user-service",
  "status": "healthy",
  "timestamp": "2025-12-18T10:30:00+00:00"
}
```

---

### 1. Get All Users (List with Pagination)

**Endpoint:** `GET /api/v1/users`  
**Authentication:** ✅ Required  
**Permission:** `users.view`

**Query Parameters:**
- `status` (optional) - Filter by status: `active`, `inactive`, `suspended`
- `role` (optional) - Filter by role name
- `search` (optional) - Search in first_name, last_name, username, email
- `division_id` (optional) - Filter by division
- `per_page` (optional) - Items per page (default: 15)

**Request Example:**
```bash
curl -X GET "http://localhost:8002/api/v1/users?status=active&per_page=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "username": "john.doe",
        "email": "john.doe@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "full_name": "John Doe",
        "phone": "08123456789",
        "division_id": 1,
        "status": "active",
        "last_login": "2025-12-18T10:00:00+00:00",
        "email_verified_at": "2025-12-01T00:00:00+00:00",
        "created_at": "2025-12-01T00:00:00+00:00",
        "updated_at": "2025-12-18T10:00:00+00:00",
        "roles": [
          {
            "id": 2,
            "name": "Admin"
          }
        ]
      }
    ],
    "current_page": 1,
    "total": 100,
    "per_page": 15,
    "last_page": 7
  },
  "message": "Users retrieved successfully"
}
```

---

### 2. Get Single User

**Endpoint:** `GET /api/v1/users/{id}`  
**Authentication:** ✅ Required  
**Permission:** `users.view`

**Request Example:**
```bash
curl -X GET "http://localhost:8002/api/v1/users/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john.doe",
    "email": "john.doe@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "phone": "08123456789",
    "division": {
      "id": 1,
      "name": "IT Department",
      "parent_id": null,
      "status": "active"
    },
    "status": "active",
    "last_login": "2025-12-18T10:00:00+00:00",
    "roles": [
      {
        "id": 2,
        "name": "Admin"
      }
    ],
    "permissions": [
      {
        "id": 1,
        "name": "users.view"
      },
      {
        "id": 2,
        "name": "users.create"
      }
    ],
    "created_at": "2025-12-01T00:00:00+00:00",
    "updated_at": "2025-12-18T10:00:00+00:00"
  },
  "message": "User retrieved successfully"
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "error": "User not found",
  "message": "The requested user does not exist"
}
```

---

### 3. Create New User

**Endpoint:** `POST /api/v1/users`  
**Authentication:** ✅ Required  
**Permission:** `users.create`

**Request Body:**
```json
{
  "username": "jane.smith",
  "email": "jane.smith@example.com",
  "password": "SecurePass123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "08987654321",
  "division_id": 2,
  "status": "active",
  "role": "Manager"
}
```

**Validation Rules:**
- `username` - required, unique, min:3, max:50, alphanumeric
- `email` - required, unique, valid email format
- `password` - required, min:8, must contain uppercase, lowercase, number
- `first_name` - required, string, max:100
- `last_name` - required, string, max:100
- `phone` - optional, numeric, min:10, max:15
- `division_id` - optional, exists in divisions table
- `status` - optional, enum: active, inactive, suspended
- `role` - optional, string (default: "User")

**Request Example:**
```bash
curl -X POST "http://localhost:8002/api/v1/users" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane.smith",
    "email": "jane.smith@example.com",
    "password": "SecurePass123!",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "Manager"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "jane.smith",
    "email": "jane.smith@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "full_name": "Jane Smith",
    "phone": null,
    "division_id": null,
    "status": "active",
    "roles": [
      {
        "id": 5,
        "name": "Manager"
      }
    ],
    "created_at": "2025-12-18T11:00:00+00:00"
  },
  "message": "User created successfully"
}
```

**Response (422 Validation Error):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "username": [
      "The username has already been taken."
    ],
    "email": [
      "The email field must be a valid email address."
    ],
    "password": [
      "The password must contain at least one uppercase letter, one lowercase letter, and one number."
    ]
  }
}
```

**Audit Log:** ✅ Automatically created with action="created"

---

### 4. Update User

**Endpoint:** `PUT /api/v1/users/{id}`  
**Authentication:** ✅ Required  
**Permission:** `users.update`

**Request Body:** (all fields optional)
```json
{
  "first_name": "Jane Updated",
  "email": "jane.updated@example.com",
  "password": "NewSecurePass123!",
  "status": "inactive",
  "role": "Director"
}
```

**Request Example:**
```bash
curl -X PUT "http://localhost:8002/api/v1/users/2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane Updated",
    "status": "active"
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "jane.smith",
    "email": "jane.smith@example.com",
    "first_name": "Jane Updated",
    "last_name": "Smith",
    "status": "active",
    "updated_at": "2025-12-18T12:00:00+00:00"
  },
  "message": "User updated successfully"
}
```

**Audit Log:** ✅ Automatically created with action="updated", includes old_values and new_values

---

### 5. Delete User (Soft Delete)

**Endpoint:** `DELETE /api/v1/users/{id}`  
**Authentication:** ✅ Required  
**Permission:** `users.delete`

**Request Example:**
```bash
curl -X DELETE "http://localhost:8002/api/v1/users/2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Notes:**
- ⚠️ **Soft delete** - User is marked as deleted but data remains in database
- ✅ **GDPR compliant** - User data can be restored or permanently deleted
- ✅ **Audit logged** - Deletion is tracked with user_id, timestamp, IP

**Audit Log:** ✅ Automatically created with action="deleted"

---

### 6. Restore Deleted User

**Endpoint:** `POST /api/v1/users/{id}/restore`  
**Authentication:** ✅ Required  
**Permission:** `users.restore`

**Request Example:**
```bash
curl -X POST "http://localhost:8002/api/v1/users/2/restore" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "jane.smith",
    "email": "jane.smith@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "status": "active",
    "deleted_at": null,
    "restored_at": "2025-12-18T13:00:00+00:00"
  },
  "message": "User restored successfully"
}
```

**Audit Log:** ✅ Automatically created with action="restored"

---

### 7. Assign Roles to User

**Endpoint:** `POST /api/v1/users/{id}/roles`  
**Authentication:** ✅ Required  
**Permission:** `roles.assign`

**Request Body:**
```json
{
  "roles": ["Admin", "Manager"]
}
```

**Request Example:**
```bash
curl -X POST "http://localhost:8002/api/v1/users/2/roles" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roles": ["Admin", "Manager"]
  }'
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "jane.smith",
    "roles": [
      {
        "id": 2,
        "name": "Admin"
      },
      {
        "id": 5,
        "name": "Manager"
      }
    ]
  },
  "message": "Roles assigned successfully"
}
```

**Notes:**
- ⚠️ **Sync behavior** - Replaces existing roles (not additive)
- ✅ Roles must exist in database (use RoleSeeder)

**Audit Log:** ✅ Automatically created with action="assign_roles"

---

### 8. Get User Permissions

**Endpoint:** `GET /api/v1/users/{id}/permissions`  
**Authentication:** ✅ Required  
**Permission:** `permissions.view`

**Request Example:**
```bash
curl -X GET "http://localhost:8002/api/v1/users/2/permissions" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "direct_permissions": [
      "users.view",
      "tickets.create"
    ],
    "role_permissions": [
      "users.view",
      "users.create",
      "users.update",
      "users.delete",
      "roles.view"
    ],
    "all_permissions": [
      "users.view",
      "users.create",
      "users.update",
      "users.delete",
      "roles.view",
      "tickets.create"
    ]
  },
  "message": "User permissions retrieved successfully"
}
```

---

## 🔐 RBAC (Role-Based Access Control)

### 8 Predefined Roles

| Role | Permissions | Description |
|------|-------------|-------------|
| **Super Admin** | 18 (ALL) | Full system access - all operations |
| **Admin** | 13 | User, role, division management |
| **Management** | 8 | Strategic management level |
| **Director** | 5 | Senior management with view/approve rights |
| **Manager** | 4 | Department/team management |
| **Receptionist** | 2 | Front desk operations |
| **Technician** | 1 | Technical staff |
| **User** | 1 | Basic user access (view own profile) |

### 18 Available Permissions

**User Management:**
- `users.view` - View user list and profiles
- `users.create` - Create new users
- `users.update` - Update user information
- `users.delete` - Delete (soft delete) users
- `users.restore` - Restore soft-deleted users

**Role Management:**
- `roles.view` - View roles
- `roles.create` - Create new roles
- `roles.update` - Update roles
- `roles.delete` - Delete roles

**Division Management:**
- `divisions.view` - View divisions
- `divisions.create` - Create new divisions
- `divisions.update` - Update divisions
- `divisions.delete` - Delete divisions

**Permission Management:**
- `permissions.view` - View permissions
- `permissions.assign` - Assign permissions to users/roles

**Audit & Settings:**
- `audit-logs.view` - View audit logs
- `settings.view` - View system settings
- `settings.update` - Update system settings

### Role Assignment

**Default Role:** When creating a user without specifying a role, the default "User" role is automatically assigned.

**Custom Assignment:**
```json
{
  "username": "new.user",
  "email": "new.user@example.com",
  "password": "SecurePass123!",
  "first_name": "New",
  "last_name": "User",
  "role": "Manager"
}
```

**Multiple Roles:**
```bash
POST /api/v1/users/2/roles
{
  "roles": ["Admin", "Manager"]
}
```

---

## 🔑 Authentication

### JWT Token Authentication

The User Service uses **Laravel Sanctum** for API authentication. All endpoints (except `/health`) require a valid JWT token in the Authorization header.

**Header Format:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Getting a Token

Users must authenticate through the **Auth Service** (port 8001) to obtain a JWT token:

```bash
# Login to get token
curl -X POST "http://localhost:8001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

### Using the Token

```bash
curl -X GET "http://localhost:8002/api/v1/users" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

### Token Expiration

- **Access Token:** 60 minutes
- **Refresh Token:** 7 days

Use the Auth Service's `/refresh` endpoint to get a new access token.

---

## 📝 Request/Response Examples

### Example 1: Create Admin User

```bash
POST http://localhost:8002/api/v1/users
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "username": "admin.user",
  "email": "admin@company.com",
  "password": "AdminPass123!",
  "first_name": "Admin",
  "last_name": "User",
  "phone": "08123456789",
  "division_id": 1,
  "status": "active",
  "role": "Admin"
}
```

### Example 2: Search Users

```bash
GET http://localhost:8002/api/v1/users?search=john&status=active
Authorization: Bearer YOUR_TOKEN
```

### Example 3: Update User Status

```bash
PUT http://localhost:8002/api/v1/users/5
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "suspended"
}
```

### Example 4: Filter by Role

```bash
GET http://localhost:8002/api/v1/users?role=Technician&per_page=50
Authorization: Bearer YOUR_TOKEN
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | User retrieved successfully |
| 201 | Created | User created successfully |
| 400 | Bad Request | Invalid request format |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | User not found |
| 422 | Validation Error | Invalid input data |
| 500 | Server Error | Internal server error |

### Error Response Format

**Validation Error (422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "The email has already been taken."
    ],
    "password": [
      "The password must be at least 8 characters."
    ]
  }
}
```

**Authentication Error (401):**
```json
{
  "message": "Unauthenticated."
}
```

**Not Found Error (404):**
```json
{
  "success": false,
  "error": "User not found",
  "message": "The requested user does not exist"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred. Please try again."
}
```

---

## 🧪 Testing

### Run All Tests

```bash
php artisan test
```

**Expected Output:**
```
PASS  Tests\Unit\ExampleTest
PASS  Tests\Unit\UserServiceTest (21 tests)
PASS  Tests\Feature\ExampleTest
PASS  Tests\Feature\UserControllerTest (20 tests)

Tests:  43 passed (278 assertions)
Duration: 4.98s
```

### Run Specific Test Suite

```bash
# Feature tests only
php artisan test --testsuite=Feature

# Unit tests only
php artisan test --testsuite=Unit

# Specific test file
php artisan test tests/Feature/UserControllerTest.php

# Specific test method
php artisan test --filter=test_store_createsNewUser_withValidData
```

### Code Coverage (Requires Xdebug/PCOV)

```bash
php artisan test --coverage
php artisan test --coverage --min=80
```

### Test Database

Tests use the `RefreshDatabase` trait, which:
- ✅ Automatically runs migrations before each test
- ✅ Rolls back all changes after each test
- ✅ Ensures test isolation (no data pollution)

---

## 🔧 Troubleshooting

### Issue 1: "Unauthenticated" Error

**Problem:** All requests return 401 Unauthorized

**Solutions:**
1. Check if token is included in Authorization header
2. Verify token is valid (not expired)
3. Ensure Sanctum is configured in `config/sanctum.php`
4. Check SANCTUM_STATEFUL_DOMAINS in .env

```bash
# Test token validity
curl -X GET "http://localhost:8001/api/v1/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Issue 2: "Column not found" Database Error

**Problem:** Migration mismatch

**Solution:**
```bash
php artisan migrate:fresh --seed
php artisan db:seed --class=RoleSeeder
```

---

### Issue 3: "Role does not exist" Error

**Problem:** Roles not seeded

**Solution:**
```bash
php artisan db:seed --class=RoleSeeder
```

---

### Issue 4: Tests Failing

**Problem:** Test database not configured

**Solution:**
1. Ensure `RefreshDatabase` trait is used in test classes
2. Run migrations before tests
3. Check test database connection in phpunit.xml

```bash
php artisan test --stop-on-failure
```

---

### Issue 5: Service Not Accessible

**Problem:** Port conflict or service not running

**Solution:**
```bash
# Check if port 8002 is in use
netstat -an | findstr :8002

# Start service
php artisan serve --port=8002

# Or with Docker
docker compose up -d user-service
```

---

## 📚 Additional Resources

### Related Documentation

- [Custom Roadmap](../../docs/task/09_CUSTOM_ROADMAP_BASED_ON_QUESTIONNAIRE.md) - Development timeline
- [Architecture Details](../../docs/task/02_ARSITEKTUR_DETAIL_MICROSERVICES.md) - System architecture
- [Quick Reference](../../docs/task/QUICK_REFERENCE.md) - Command cheatsheet

### External Documentation

- [Laravel 10 Documentation](https://laravel.com/docs/10.x)
- [Spatie Permission](https://spatie.be/docs/laravel-permission/v5/introduction)
- [Laravel Sanctum](https://laravel.com/docs/10.x/sanctum)
- [PHPUnit Testing](https://phpunit.de/documentation.html)

---

## 📞 Support

**Issues?** Check:
1. Database migrations are up to date
2. RoleSeeder has been run
3. Auth Service is running (port 8001)
4. JWT token is valid and not expired
5. User has required permissions

**Need Help?**
- Review test files for implementation examples
- Check audit_logs table for operation history
- Review Laravel logs: `storage/logs/laravel.log`

---

## ✅ Service Status

**Current Status:** ✅ Production Ready

**Completed:**
- ✅ 43 tests passing (100%)
- ✅ 8 roles seeded with proper permissions
- ✅ Comprehensive audit logging
- ✅ GDPR-compliant soft deletes
- ✅ Input validation on all endpoints
- ✅ Error handling with proper status codes
- ✅ API documentation complete

**Next Steps:**
- Move to Ticket Service development (Phase 2, Priority #1)
- Integrate with Meeting Room Service (Priority #3)
- Add code coverage measurement (requires Xdebug)

---

**Last Updated:** December 18, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
