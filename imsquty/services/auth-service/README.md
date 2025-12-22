# Auth Service - IMSQuty Microservices

JWT-based authentication and authorization service for IMSQuty system.

## Features

- ✅ JWT Access & Refresh Tokens
- ✅ Login/Logout/Refresh Token
- ✅ Token Blacklisting
- ✅ Rate Limiting (5 attempts/min)
- ✅ Account Lockout (10 failed = 15 min lockout)
- ✅ Audit Logging (ISO 27001 + GDPR + SOC 2)
- ✅ Password Reset
- ✅ Session Management
- ✅ GDPR Compliance

## API Endpoints

### Authentication

```bash
POST   /api/v1/auth/login       - Login with email & password
POST   /api/v1/auth/logout      - Logout (invalidate token)
POST   /api/v1/auth/refresh     - Refresh access token
GET    /api/v1/auth/me          - Get current user info
POST   /api/v1/auth/register    - Register new user (admin only)
```

### Password Management

```bash
POST   /api/v1/auth/password/forgot    - Request password reset
POST   /api/v1/auth/password/reset     - Reset password with token
POST   /api/v1/auth/password/change    - Change password (authenticated)
```

### Token Management

```bash
POST   /api/v1/auth/token/revoke       - Revoke specific token
POST   /api/v1/auth/token/revoke-all   - Revoke all user tokens
GET    /api/v1/auth/token/validate     - Validate token
```

## Request/Response Examples

### Login

**Request:**
```bash
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@quty.co.id",
    "password": "123456"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "email": "admin@quty.co.id",
      "username": "admin",
      "first_name": "System",
      "last_name": "Administrator"
    }
  },
  "message": "Login successful"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**Error Response (429 - Rate Limited):**
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_ATTEMPTS",
    "message": "Too many login attempts. Try again in 15 minutes."
  }
}
```

### Logout

**Request:**
```bash
curl -X POST http://localhost:8001/api/v1/auth/logout \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### Refresh Token

**Request:**
```bash
curl -X POST http://localhost:8001/api/v1/auth/refresh \
  -H "Authorization: Bearer {refresh_token}"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "expires_in": 3600
  },
  "message": "Token refreshed successfully"
}
```

### Get Current User

**Request:**
```bash
curl -X GET http://localhost:8001/api/v1/auth/me \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@quty.co.id",
    "username": "admin",
    "first_name": "System",
    "last_name": "Administrator",
    "status": "active",
    "last_login": "2025-12-18T10:30:00Z"
  }
}
```

## Setup

### 1. Install Dependencies

```bash
cd services/auth-service
composer install
```

### 2. Configure Environment

```bash
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
```

### 3. Run Migrations

```bash
php artisan migrate
```

### 4. Start Service

```bash
php artisan serve --host=0.0.0.0 --port=8001
```

## Testing

```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter=AuthControllerTest

# Run with coverage
php artisan test --coverage

# Run only unit tests
php artisan test --testsuite=Unit

# Run only feature tests
php artisan test --testsuite=Feature
```

## Security Features

### Rate Limiting
- **Login:** 5 attempts per minute per IP
- **Password Reset:** 3 attempts per hour per email
- **Lockout:** 10 failed attempts = 15 minutes lockout

### Token Security
- **Access Token:** 60 minutes expiry
- **Refresh Token:** 14 days expiry
- **Blacklisting:** Revoked tokens stored in Redis
- **Algorithm:** HS256 (HMAC SHA-256)

### Audit Logging
All authentication events are logged:
- Login attempts (success/failure)
- Logout events
- Token refreshes
- Password changes
- Account lockouts

**Stored Data:**
- User ID
- Action type
- IP address
- User agent
- Timestamp
- Old/new values (for changes)

**Retention:** 365 days (ISO 27001 + GDPR compliance)

## Database Tables

### `users` (Shared)
Main user authentication table.

### `jwt_blacklist`
Stores revoked JWT tokens.

### `login_history`
Tracks all login attempts.

### `password_resets`
Stores password reset tokens.

### `audit_logs` (Shared)
Stores all authentication audit logs.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing secret | (generated) |
| `JWT_TTL` | Access token TTL (minutes) | 60 |
| `JWT_REFRESH_TTL` | Refresh token TTL (minutes) | 20160 (14 days) |
| `JWT_BLACKLIST_ENABLED` | Enable token blacklisting | true |
| `RATE_LIMIT_LOGIN` | Login attempts per minute | 5 |
| `LOCKOUT_ATTEMPTS` | Failed attempts before lockout | 10 |
| `LOCKOUT_DURATION` | Lockout duration (seconds) | 900 (15 min) |
| `PASSWORD_MIN_LENGTH` | Minimum password length | 6 |
| `AUDIT_LOG_ENABLED` | Enable audit logging | true |

## Architecture

```
AuthController (Thin)
    ↓
AuthService (Business Logic)
    ↓ ↓
JwtService  AuthRepository
    ↓           ↓
Redis      Database
```

## Dependencies

- **Laravel 10+**
- **PHP 8.1+**
- **tymon/jwt-auth** - JWT implementation
- **spatie/laravel-permission** - RBAC (for future)
- **predis/predis** - Redis client

## Compliance

- ✅ **ISO 27001** - Information security management
- ✅ **GDPR** - Data protection & privacy
- ✅ **SOC 2** - Service organization controls

## Development Team

- **Service Owner:** Auth Team
- **Port:** 8001
- **Database:** Shared MySQL (imstest_quty)
- **Cache:** Shared Redis
- **Queue:** Shared RabbitMQ

## Links

- [API Gateway](http://localhost:8000)
- [User Service](http://localhost:8002)
- [Notification Service](http://localhost:8010)

---

**IMSQuty Auth Service** - Secure Authentication & Authorization
