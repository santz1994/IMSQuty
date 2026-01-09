# 🔐 IMSQuty - Test User Credentials

**Test Date:** January 9, 2026  
**Frontend URL:** http://localhost:5173  
**Backend API:** http://localhost:8000

---

## 📋 All Test Users

| # | Username | Email | Password | Role | Department | Status |
|---|----------|-------|----------|------|------------|--------|
| 1 | `superadmin` | superadmin@quty.co.id | `password123` | Super Admin | IT Infrastructure | ✅ Active |
| 2 | `director` | director@quty.co.id | `password123` | Director (Manager role) | IT | ✅ Active |
| 3 | `manager` | manager@quty.co.id | `password123` | Manager | IT Development | ✅ Active |
| 4 | `admin` | admin@quty.co.id | `password123` | Admin | IT Support | ✅ Active |
| 5 | `hr` | hr@quty.co.id | `password123` | HR | Human Resources | ✅ Active |
| 6 | `user` | user@quty.co.id | `password123` | User | Operations | ✅ Active |

---

## 🧪 Login Test Instructions

### **1. Open Frontend**
```
http://localhost:5173
```

### **2. Test Each User**

#### **Test 1: Super Admin (Full Access)**
```
Email: superadmin@quty.co.id
Password: password123
```
**Expected Access:**
- ✅ Full system access
- ✅ User management
- ✅ Role & permission management
- ✅ System settings
- ✅ All modules (Assets, Tickets, Financial, etc.)
- ✅ Dashboard: Super Admin view with all metrics

---

#### **Test 2: Director (Strategic View)**
```
Email: director@quty.co.id
Password: password123
```
**Expected Access:**
- ✅ Business metrics dashboard
- ✅ Financial overview
- ✅ Department performance
- ✅ Read access to most modules
- ⚠️ Limited write access
- ❌ No user/role management
- ✅ Dashboard: Director view with business metrics

---

#### **Test 3: Manager (Team Operations)**
```
Email: manager@quty.co.id
Password: password123
```
**Expected Access:**
- ✅ Team management
- ✅ Asset management (CRUD)
- ✅ Ticket management (CRUD)
- ✅ Approval workflows
- ✅ Team reports
- ⚠️ Department-level view only
- ❌ No system settings
- ✅ Dashboard: Manager view with team metrics

---

#### **Test 4: Admin (IT Support)**
```
Email: admin@quty.co.id
Password: password123
```
**Expected Access:**
- ✅ Asset management (CRUD)
- ✅ Ticket management (CRUD)
- ✅ User support functions
- ✅ Basic reports
- ⚠️ Limited to assigned department
- ❌ No financial access
- ❌ No user management
- ✅ Dashboard: Admin view with support metrics

---

#### **Test 5: HR (Human Resources)**
```
Email: hr@quty.co.id
Password: password123
```
**Expected Access:**
- ✅ Employee data view
- ✅ Department structure
- ✅ User profiles (read)
- ✅ HR reports
- ⚠️ Limited asset access
- ❌ No ticket management
- ❌ No financial access
- ✅ Dashboard: HR view with employee metrics

---

#### **Test 6: Regular User**
```
Email: user@quty.co.id
Password: password123
```
**Expected Access:**
- ✅ Submit tickets
- ✅ View own tickets
- ✅ View assigned assets
- ✅ Personal profile
- ✅ Meeting room booking
- ❌ No admin functions
- ❌ No management access
- ❌ Limited reports
- ✅ Dashboard: User view with personal metrics

---

## ✅ Test Checklist

### **Login Functionality**
- [ ] All users can login successfully
- [ ] Correct dashboard shown per role
- [ ] Invalid credentials show error
- [ ] Remember me functionality works
- [ ] Logout works properly
- [ ] Session persists on refresh

### **Role-Based Access Control (RBAC)**
- [ ] Super Admin sees all features
- [ ] Director has read-only for most modules
- [ ] Manager can manage team resources
- [ ] Admin limited to support functions
- [ ] HR restricted to HR modules
- [ ] User has minimal access

### **Dashboard Views**
- [ ] Super Admin: All metrics (users, assets, tickets, financial)
- [ ] Director: Business metrics (revenue, costs, ROI, KPIs)
- [ ] Manager: Team metrics (pending tasks, team performance)
- [ ] Admin: Support metrics (open tickets, SLA compliance)
- [ ] HR: Employee metrics (headcount, attendance)
- [ ] User: Personal metrics (my tickets, my assets)

### **Security**
- [ ] JWT tokens issued correctly
- [ ] Refresh token works
- [ ] Unauthorized access blocked
- [ ] Password validation works
- [ ] Session timeout works

---

## 🐛 Common Issues & Solutions

### **Issue 1: Login Button Not Working**
```
Solution: Check browser console for errors
- Open DevTools (F12)
- Check Console tab
- Look for API errors
```

### **Issue 2: "Cannot read properties of undefined"**
```
Solution: Backend service not running
docker ps | grep auth-service
# Should show: imsquty-auth-service (healthy)
```

### **Issue 3: CORS Error**
```
Solution: Check API Gateway configuration
- API Gateway should be running on port 8000
- Frontend configured to use: http://localhost:8000/api/v1
```

### **Issue 4: "Network Error"**
```
Solution: Check all services are healthy
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## 📊 Test Results Template

```
=== LOGIN TEST RESULTS ===
Date: [DATE]
Tester: [NAME]

✅ PASSED: [X]/6 users
❌ FAILED: [X]/6 users

Details:
1. Super Admin: [✅/❌] - Notes: ___________
2. Director: [✅/❌] - Notes: ___________
3. Manager: [✅/❌] - Notes: ___________
4. Admin: [✅/❌] - Notes: ___________
5. HR: [✅/❌] - Notes: ___________
6. User: [✅/❌] - Notes: ___________

Dashboard Rendering:
- Super Admin Dashboard: [✅/❌]
- Director Dashboard: [✅/❌]
- Manager Dashboard: [✅/❌]
- Admin Dashboard: [✅/❌]
- HR Dashboard: [✅/❌]
- User Dashboard: [✅/❌]

RBAC Validation:
- Unauthorized access blocked: [✅/❌]
- Role permissions enforced: [✅/❌]
- Menu items filtered by role: [✅/❌]

Issues Found:
1. ___________________________________
2. ___________________________________
3. ___________________________________
```

---

## 🔧 Quick Test Commands

### **Backend Health Check**
```bash
# Check Auth Service
curl http://localhost:8001/api/v1/health

# Check API Gateway
curl http://localhost:8000/health

# Check Database Connection
docker exec imsquty-mysql mysqladmin ping -h localhost -u imsquty -pimsquty112233
```

### **View User Data**
```bash
# List all users
docker exec imsquty-mysql mysql -uimsquty -pimsquty112233 imsquty -e "SELECT id, username, email FROM users;"

# Check user roles
docker exec imsquty-mysql mysql -uimsquty -pimsquty112233 imsquty -e "SELECT u.username, r.name as role FROM users u JOIN model_has_roles mhr ON u.id = mhr.model_id JOIN roles r ON mhr.role_id = r.id WHERE mhr.model_type = 'App\\\\Models\\\\User';"
```

### **Test Login API Directly**
```bash
# Test login via curl
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@quty.co.id","password":"password123"}'
```

---

## 📝 Notes

- All passwords are `password123` (development only!)
- Users created via `TestUsersSeeder.php`
- Roles assigned via Spatie Permission package
- Production: Use strong passwords and proper security
- Email verification disabled for testing

---

**Happy Testing! 🚀**
