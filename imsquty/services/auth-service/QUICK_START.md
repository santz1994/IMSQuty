# 🚀 Quick Start - Auth Service

**Get the Auth Service running in 5 minutes!**

---

## ✅ Prerequisites Check

```powershell
# Check PHP version (need 8.1+)
php -v

# Check Composer
composer --version

# Check MySQL
mysql --version

# Check if database exists
mysql -u root -e "SHOW DATABASES LIKE 'imstest_quty';"
```

If database doesn't exist:
```sql
mysql -u root
CREATE DATABASE imstest_quty CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

---

## 🎯 Option 1: Automated Setup (Recommended)

```powershell
cd d:\Project\ITQuty\itquty-microservices\services\auth-service
.\setup.ps1
```

**Done!** The script will handle everything.

---

## 🎯 Option 2: Manual Setup (5 Steps)

### Step 1: Install Dependencies
```bash
composer install
```

### Step 2: Configure Environment
```bash
# Copy environment file
cp .env.example .env

# Edit .env if needed (default values should work):
# DB_HOST=127.0.0.1
# DB_DATABASE=imstest_quty
# DB_USERNAME=root
# DB_PASSWORD=
```

### Step 3: Generate Keys
```bash
php artisan key:generate
php artisan jwt:secret
```

### Step 4: Run Migrations
```bash
php artisan migrate
```

### Step 5: Start Service
```bash
php artisan serve --host=0.0.0.0 --port=8001
```

**Service running at:** http://localhost:8001

---

## 🧪 Test It Works

### 1. Health Check
```bash
curl http://localhost:8001/api/v1/health
```

Expected: `{"success":true,"service":"auth-service","status":"healthy"...}`

### 2. Login Test
```bash
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@quty.co.id\",\"password\":\"123456\"}"
```

Expected: `{"success":true,"data":{"access_token":"..."}...}`

---

## 🧪 Run Tests

```bash
# All tests
php artisan test

# With coverage
php artisan test --coverage

# Specific test
php artisan test --filter=AuthControllerTest
```

---

## 📁 Project Structure

```
auth-service/
├── app/
│   ├── Http/Controllers/AuthController.php    ← API endpoints
│   ├── Services/AuthService.php               ← Business logic
│   ├── Repositories/AuthRepository.php        ← Data access
│   └── Models/User.php                        ← User model
├── routes/api.php                             ← API routes
├── tests/                                     ← Tests (80%+ coverage)
├── .env.example                               ← Config template
└── README.md                                  ← Full documentation
```

---

## 🔗 API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/auth/login` | POST | No | Login with email/password |
| `/api/v1/auth/logout` | POST | Yes | Logout current session |
| `/api/v1/auth/refresh` | POST | No | Refresh access token |
| `/api/v1/auth/me` | GET | Yes | Get current user |
| `/api/v1/health` | GET | No | Health check |

---

## 🔐 Default Credentials

```
Email: admin@quty.co.id
Password: 123456
```

*(These exist in the shared database from init SQL)*

---

## ⚙️ Configuration

### Key Settings in .env

```env
# Database (Local)
DB_HOST=127.0.0.1
DB_DATABASE=imstest_quty
DB_USERNAME=root
DB_PASSWORD=

# JWT Configuration
JWT_TTL=60              # Access token: 60 minutes
JWT_REFRESH_TTL=20160   # Refresh token: 14 days

# Security
RATE_LIMIT_LOGIN=5      # 5 attempts per minute
LOCKOUT_ATTEMPTS=10     # Lockout after 10 fails
LOCKOUT_DURATION=900    # Lockout for 15 minutes
```

---

## 🐛 Common Issues

### "Class 'Tymon\JWTAuth\...' not found"
```bash
composer require tymon/jwt-auth:^2.0
php artisan jwt:secret
```

### "SQLSTATE[HY000] [1049] Unknown database"
```bash
mysql -u root -e "CREATE DATABASE imstest_quty;"
php artisan migrate
```

### "No application encryption key"
```bash
php artisan key:generate
```

### Tests failing
```bash
php artisan config:clear
php artisan migrate:fresh --env=testing
php artisan test
```

---

## 📊 What's Included

- ✅ JWT Authentication (access + refresh tokens)
- ✅ Rate Limiting (5 attempts/min)
- ✅ Account Lockout (10 fails = 15 min)
- ✅ Audit Logging (all login attempts)
- ✅ Comprehensive Tests (80%+ coverage)
- ✅ Security Best Practices
- ✅ GDPR/ISO/SOC2 Compliance

---

## 📚 Full Documentation

- **README.md** - Complete API documentation
- **DEVELOPMENT_SUMMARY.md** - Development details
- **Code Comments** - PHPDoc throughout

---

## 🎯 Next Steps

1. ✅ Auth Service running locally
2. ⏳ Add to Docker Compose
3. ⏳ Integrate with API Gateway
4. ⏳ Build User Service
5. ⏳ Build Ticket Service

---

**Need Help?**
- Check **README.md** for detailed docs
- Review **tests/** for usage examples
- See **DEVELOPMENT_SUMMARY.md** for architecture

---

*IMSQuty Auth Service v1.0.0*
