# 🐳 DOCKER QUICK REFERENCE - IMSQuty

**Quick commands untuk deploy dan manage aplikasi IMSQuty menggunakan Docker**

---

## 🚀 DEPLOYMENT COMMANDS

### Start Infrastructure Only
```powershell
cd d:\Project\ITQuty\imsquty
docker-compose up -d mysql redis minio mailhog
```

### Start ALL Services (Full Stack)
```powershell
cd d:\Project\ITQuty\imsquty
docker-compose up -d
```

### First Time Build + Deploy
```powershell
cd d:\Project\ITQuty\imsquty
docker-compose build --parallel
docker-compose up -d
```

---

## 🛑 STOP & CLEANUP

### Stop All Services
```powershell
docker-compose down
```

### Stop + Remove Volumes (Clean Slate)
```powershell
docker-compose down -v
```

### Remove All Images (Force Rebuild)
```powershell
docker-compose down --rmi all
```

---

## 📊 MONITORING

### View All Containers
```powershell
docker ps
```

### View Specific Service Logs
```powershell
docker-compose logs -f auth-service
docker-compose logs -f asset-service
docker-compose logs -f mysql
```

### View All Logs
```powershell
docker-compose logs -f
```

### View Last 50 Lines
```powershell
docker-compose logs --tail=50
```

### Real-time Resource Usage
```powershell
docker stats
```

---

## 🔧 MAINTENANCE

### Restart Single Service
```powershell
docker-compose restart auth-service
```

### Restart All Services
```powershell
docker-compose restart
```

### Rebuild Single Service
```powershell
docker-compose build auth-service
docker-compose up -d auth-service
```

### Execute Command in Container
```powershell
# MySQL query
docker exec imsquty-mysql mysql -uimsquty -pimsquty112233 imsquty -e "SHOW TABLES;"

# Redis ping
docker exec imsquty-redis redis-cli ping

# Shell access
docker exec -it imsquty-mysql bash
```

---

## 🗄️ DATABASE OPERATIONS

### Run Migrations (When Service Starts)
```powershell
docker-compose exec auth-service php artisan migrate
```

### Seed Database
```powershell
docker-compose exec auth-service php artisan db:seed
```

### Database Backup
```powershell
docker exec imsquty-mysql mysqldump -uroot -pimsquty112233 imsquty > backup.sql
```

### Database Restore
```powershell
Get-Content backup.sql | docker exec -i imsquty-mysql mysql -uroot -pimsquty112233 imsquty
```

---

## 🔐 CREDENTIALS

### MySQL
```
Host: localhost:3306
User: imsquty
Password: imsquty112233
Database: imsquty
```

### Redis
```
Host: localhost:6379
Password: imsquty112233
```

### MinIO
```
Console: http://localhost:9001
User: imsquty_minio
Password: imsquty112233
```

### MailHog
```
SMTP: localhost:1025
Web UI: http://localhost:8025
```

### Application
```
Email: admin@quty.co.id
Password: password123
```

---

## 🌐 ACCESS URLs

### Infrastructure
- MySQL: `localhost:3306`
- Redis: `localhost:6379`
- MinIO Console: `http://localhost:9001`
- MailHog UI: `http://localhost:8025`
- RabbitMQ: `http://localhost:15672`

### Microservices (When Running)
- API Gateway: `http://localhost:8000`
- Auth Service: `http://localhost:8001`
- User Service: `http://localhost:8002`
- Asset Service: `http://localhost:8003`
- Ticket Service: `http://localhost:8004`
- Inventory: `http://localhost:8005`
- Financial: `http://localhost:8006`
- Meeting Room: `http://localhost:8007`
- Master Data: `http://localhost:8008`
- Reporting: `http://localhost:8009`
- Notification: `http://localhost:8010`

### Frontend
- Web App: `http://localhost:5173`

---

## 🧪 HEALTH CHECKS

### Infrastructure Health
```powershell
# All containers
docker ps -a

# Specific service health
docker inspect --format='{{.State.Health.Status}}' imsquty-mysql
docker inspect --format='{{.State.Health.Status}}' imsquty-redis
```

### Database Connection
```powershell
docker exec imsquty-mysql mysql -uimsquty -pimsquty112233 -e "SELECT 'OK' as status;"
```

### Redis Connection
```powershell
docker exec imsquty-redis redis-cli ping
```

---

## 🐛 TROUBLESHOOTING

### Port Already in Use
```powershell
# Find process
netstat -ano | findstr :3306

# Change port in docker-compose.yml
# "3307:3306" instead of "3306:3306"
```

### Container Won't Start
```powershell
# Check logs
docker-compose logs service-name

# Inspect container
docker inspect imsquty-service-name

# Force recreate
docker-compose up -d --force-recreate service-name
```

### Out of Disk Space
```powershell
# Clean up
docker system prune -a

# Check usage
docker system df
```

### Database Connection Failed
```powershell
# Wait for startup
Start-Sleep -Seconds 30

# Verify credentials
docker exec imsquty-mysql env | Select-String "MYSQL"
```

---

## 📦 VOLUME MANAGEMENT

### List Volumes
```powershell
docker volume ls | Select-String "imsquty"
```

### Inspect Volume
```powershell
docker volume inspect imsquty_mysql_data
```

### Backup Volume
```powershell
docker run --rm -v imsquty_mysql_data:/data -v ${PWD}:/backup ubuntu tar czf /backup/mysql_backup.tar.gz /data
```

### Remove Volume
```powershell
docker volume rm imsquty_mysql_data
```

---

## 🔄 COMMON WORKFLOWS

### Fresh Start
```powershell
docker-compose down -v
docker-compose up -d
# Wait 30 seconds
docker-compose exec auth-service php artisan migrate --seed
```

### Update Code and Restart
```powershell
git pull
docker-compose build service-name
docker-compose up -d service-name
```

### View Real-time Logs
```powershell
docker-compose logs -f --tail=100
```

### Export Logs to File
```powershell
docker-compose logs > logs.txt
```

---

## ⚡ ONE-LINERS

```powershell
# Stop, clean, rebuild, start
docker-compose down -v; docker-compose build --parallel; docker-compose up -d

# Restart all unhealthy containers
docker ps -a --filter health=unhealthy --format "{{.Names}}" | ForEach-Object { docker restart $_ }

# Show only running containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Follow logs of multiple services
docker-compose logs -f mysql redis auth-service

# Quick health check all
docker ps --format "{{.Names}}: {{.Status}}"
```

---

## 📚 DOCUMENTATION

- [DOCKER_DEPLOYMENT_SUCCESS.md](DOCKER_DEPLOYMENT_SUCCESS.md) - Complete guide
- [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md) - Production steps
- [SESSION15_FINAL_COMPLETION_REPORT.md](SESSION15_FINAL_COMPLETION_REPORT.md) - Final report

---

**Created**: January 9, 2026  
**Status**: ✅ Ready to Use  
**Docker**: All services containerized and ready! 🐳
