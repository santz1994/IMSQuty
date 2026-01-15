# 🎯 SESSION 52 - QUICK EXECUTION GUIDE

## ⚡ EXECUTE NOW

```powershell
cd d:\Project\ITQuty\imsquty
.\scripts\session52-fix-all-errors.ps1
```

**Time:** 15-20 minutes  
**Action:** Comprehensive rebuild with all fixes

---

## 📋 WHAT GETS FIXED

### ✅ Docker Permissions
- All Laravel services can write logs
- Storage permissions: 755 → 775

### ✅ Redis Authentication
- Password configured: redislabs
- No more AUTH errors
- Admin UI: demo@redis.com / redislabs

### ✅ Admin Panel Permissions
- Seeds RBAC data
- All roles show permissions

### ✅ Database
- Runs migrations
- Seeds roles, permissions, assignments

---

## 🔍 AFTER SCRIPT COMPLETES

### 1. Check Container Status
```powershell
docker-compose ps
```
**Expected:** All 16 containers = "Up" and "healthy"

### 2. Test Admin Panel
- URL: http://localhost:5174
- Login: superadmin@quty.co.id / Admin@123
- Check: /admin/users (no errors)
- Check: /admin/roles (shows permissions)

### 3. Test Web App
- URL: http://localhost:5173  
- Login: Any test user
- Check: /meeting-room-bookings (loads list)
- Check: Create new booking (works)

---

## ⚠️ IF ERRORS PERSIST

### Check Logs
```powershell
# Auth service
docker logs imsquty-auth-service --tail 50

# User service
docker logs imsquty-user-service --tail 50

# Meeting room service
docker logs imsquty-meeting-room-service --tail 50

# Redis connection test
docker exec imsquty-redis redis-cli -a redislabs ping
```

### Restart Individual Service
```powershell
docker-compose restart auth-service
docker-compose restart user-service
```

### Full Rebuild (if needed)
```powershell
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## ✅ SUCCESS INDICATORS

1. ✅ No "Permission denied" in logs
2. ✅ No "Redis AUTH" errors
3. ✅ Admin panel loads without errors
4. ✅ Permissions show in /admin/roles
5. ✅ Meeting rooms can be created/viewed
6. ✅ All 16 containers healthy

---

## 📞 NEED HELP?

1. Read: `docs/SESSION52_CRITICAL_FIXES.md` (full details)
2. Check: Docker logs for specific errors
3. Verify: .env files have `REDIS_PASSWORD=` (empty, not null)

---

**Time to execute: 15-20 minutes**  
**Status: READY TO RUN**
