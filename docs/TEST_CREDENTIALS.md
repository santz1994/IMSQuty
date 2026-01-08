# 🔐 TEST CREDENTIALS - IMSQuty System

**Date**: January 8, 2026  
**Status**: ✅ All accounts active and ready for testing

---

## 🔑 UNIFIED PASSWORD

**ALL ACCOUNTS USE**: `imsquty112233`

---

## 👥 TEST USER ACCOUNTS

### 1. **Super Admin** (Level 1 - Highest Authority)
```
Username: superadmin
Email: superadmin@quty.co.id
Password: imsquty112233
Role: Super Admin
Department: Infrastructure
Team: Network Team
Position: Chief Technology Officer
```

### 2. **Director** (Level 2 - Strategic Management)
```
Username: director
Email: director@quty.co.id
Password: imsquty112233
Role: Manager (acting as Director)
Department: Information Technology
Position: IT Director
```

### 3. **Manager** (Level 3 - Team Leadership)
```
Username: manager
Email: manager@quty.co.id
Password: imsquty112233
Role: Manager
Department: Development
Team: Backend Team
Position: Development Manager
```

### 4. **Admin** (Level 4 - System Administration)
```
Username: admin
Email: admin@quty.co.id
Password: imsquty112233
Role: Admin
Department: Development
Team: Backend Team
Position: System Administrator
```

### 5. **HR** (Level 5 - Human Resources)
```
Username: hr
Email: hr@quty.co.id
Password: imsquty112233
Role: Manager (HR function)
Department: Human Resources
Position: HR Manager
```

### 6. **User** (Level 6 - End User)
```
Username: user
Email: user@quty.co.id
Password: imsquty112233
Role: User
Department: Operations
Team: Quality Assurance
Position: QA Tester
```

### 7. **Developer 1** (Development Team Member)
```
Username: developer1
Email: dev1@quty.co.id
Password: imsquty112233
Role: User
Department: Development
Team: Backend Team
Position: Backend Developer
```

### 8. **Developer 2** (Development Team Member)
```
Username: developer2
Email: dev2@quty.co.id
Password: imsquty112233
Role: User
Department: Development
Team: Backend Team
Position: Frontend Developer
```

### 9. **Helpdesk** (Support Team Member)
```
Username: helpdesk
Email: helpdesk@quty.co.id
Password: imsquty112233
Role: User
Department: Infrastructure
Team: Helpdesk L1
Position: Helpdesk Technician
```

---

## 🗄️ DATABASE CREDENTIALS

### MySQL Container
```
Host: localhost
Port: 3306
Database: imsquty
Username: root
Password: imsquty112233
```

### Docker Connection String
```
Server=localhost;Port=3306;Database=imsquty;Uid=root;Pwd=imsquty112233;
```

---

## 🐳 DOCKER SERVICES

### MySQL
```
Container: imsquty-mysql
Status: Running
Port: 3306:3306
Password: imsquty112233
```

### Redis
```
Container: imsquty-redis
Status: Running (if configured)
Port: 6379
Password: imsquty112233
```

### RabbitMQ
```
Container: imsquty-rabbitmq
Status: Running (if configured)
Port: 5672 (AMQP), 15672 (Management)
Username: admin
Password: imsquty112233
```

### MinIO
```
Container: imsquty-minio
Status: Running (if configured)
Port: 9000 (API), 9001 (Console)
Access Key: admin
Secret Key: imsquty112233
```

---

## 🌐 API ENDPOINTS

### Auth Service
```
Base URL: http://localhost:8001/api
Login: POST /auth/login
Register: POST /auth/register
Logout: POST /auth/logout
```

### Example Login Request
```json
POST http://localhost:8001/api/auth/login
Content-Type: application/json

{
  "username": "superadmin",
  "password": "imsquty112233"
}
```

OR

```json
{
  "email": "superadmin@quty.co.id",
  "password": "imsquty112233"
}
```

---

## 📊 RBAC SUMMARY

| Role | Users | Permissions | Level |
|------|-------|-------------|-------|
| Super Admin | 1 | All (45) | 1 |
| Admin | 1 | Most | 2 |
| Manager | 3 | Departmental | 3 |
| Technician | 0 | Technical | 4 |
| User | 4 | Basic | 5 |
| Finance | 0 | Financial | 6 |

**Total**: 9 active test users

---

## ⚠️ SECURITY NOTES

1. **Development Only**: These credentials are for development/testing ONLY
2. **Change in Production**: MUST change all passwords before production deployment
3. **Email Domain**: All emails use @quty.co.id domain
4. **Password Policy**: Current password is simple for testing - enforce strong policy in production
5. **MFA**: Multi-factor authentication available but not enforced for test accounts

---

## 🧪 TESTING SCENARIOS

### Test 1: Login with Username
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"imsquty112233"}'
```

### Test 2: Login with Email
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quty.co.id","password":"imsquty112233"}'
```

### Test 3: Access Protected Route
```bash
curl -X GET http://localhost:8001/api/users \
  -H "Authorization: Bearer {token}"
```

---

## 📝 QUICK COMMANDS

### Check MySQL Connection
```bash
docker exec -it imsquty-mysql mysql -uroot -pimsquty112233 imsquty -e "SELECT COUNT(*) FROM users;"
```

### List All Users
```bash
docker exec -it imsquty-mysql mysql -uroot -pimsquty112233 imsquty -e "SELECT username, email FROM users;"
```

### Check User Roles
```bash
docker exec -it imsquty-mysql mysql -uroot -pimsquty112233 imsquty -e "SELECT u.username, r.name as role FROM users u JOIN model_has_roles mhr ON u.id = mhr.model_id JOIN roles r ON mhr.role_id = r.id;"
```

---

**Generated**: January 8, 2026  
**Project**: IMSQuty - Integrated Management System  
**Environment**: Development/Testing  
**Status**: ✅ Ready for Testing
