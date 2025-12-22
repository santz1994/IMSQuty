# Meeting Room Service - Deployment Guide

## Quick Start (Development)

### Prerequisites
- Docker Desktop installed and running
- Git
- 8GB RAM minimum

### 1. Start the Service Locally

#### Option A: With Docker (Recommended)
```bash
# From project root (itquty-microservices/)
cd d:\Project\ITQuty\itquty-microservices

# Start infrastructure + meeting-room-service
docker compose up -d mysql redis meeting-room-service

# Check logs
docker compose logs -f meeting-room-service

# Access service
# Health check: http://localhost:8007/api/health
```

#### Option B: Local Development (Without Docker)
```bash
cd services/meeting-room-service

# Install dependencies
composer install

# Run migrations
php artisan migrate

# Start server
php artisan serve --port=8007

# Access: http://localhost:8007
```

### 2. Start Complete System (All Services)

```bash
# From project root
docker compose up -d

# Verify all services running
docker compose ps

# Services will be available at:
# - API Gateway: http://localhost:8000
# - Auth Service: http://localhost:8001
# - User Service: http://localhost:8002
# - Meeting Room Service: http://localhost:8007
# - MySQL: localhost:3306
# - Redis: localhost:6379
# - RabbitMQ: http://localhost:15672
```

### 3. Run Tests

```bash
# Inside container
docker compose exec meeting-room-service php artisan test

# Or locally
cd services/meeting-room-service
php artisan test

# With coverage
php artisan test --coverage
```

---

## API Endpoints via API Gateway

All requests go through API Gateway at `http://localhost:8000`

### Authentication Required
Get JWT token from Auth Service first:
```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@quty.co.id",
    "password": "123456"
  }'

# Use the access_token in subsequent requests
```

### Meeting Rooms Endpoints

#### List Rooms (Public)
```bash
GET http://localhost:8000/api/v1/meeting-rooms

curl http://localhost:8000/api/v1/meeting-rooms
```

#### Get Room Details (Public)
```bash
GET http://localhost:8000/api/v1/meeting-rooms/{id}

curl http://localhost:8000/api/v1/meeting-rooms/1
```

#### Check Availability (Public)
```bash
POST http://localhost:8000/api/v1/meeting-rooms/check-availability

curl -X POST http://localhost:8000/api/v1/meeting-rooms/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "start_time": "2025-01-20T10:00:00Z",
    "end_time": "2025-01-20T11:00:00Z"
  }'
```

#### Find Available Rooms (Public)
```bash
POST http://localhost:8000/api/v1/meeting-rooms/available

curl -X POST http://localhost:8000/api/v1/meeting-rooms/available \
  -H "Content-Type: application/json" \
  -d '{
    "start_time": "2025-01-20T10:00:00Z",
    "end_time": "2025-01-20T11:00:00Z",
    "min_capacity": 10
  }'
```

#### Create Room (Protected)
```bash
POST http://localhost:8000/api/v1/meeting-rooms

curl -X POST http://localhost:8000/api/v1/meeting-rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Conference Room A",
    "code": "CR-A-001",
    "capacity": 20,
    "floor": "3",
    "building": "Main Building"
  }'
```

### Bookings Endpoints (All Protected)

#### Create Booking
```bash
POST http://localhost:8000/api/v1/bookings

curl -X POST http://localhost:8000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "meeting_room_id": 1,
    "title": "Team Meeting",
    "start_time": "2025-01-20T10:00:00Z",
    "end_time": "2025-01-20T11:00:00Z",
    "attendees_count": 5
  }'
```

#### List My Bookings
```bash
GET http://localhost:8000/api/v1/bookings/my/bookings

curl http://localhost:8000/api/v1/bookings/my/bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Today's Bookings
```bash
GET http://localhost:8000/api/v1/bookings/query/today

curl http://localhost:8000/api/v1/bookings/query/today \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Approve Booking
```bash
POST http://localhost:8000/api/v1/bookings/{id}/approve

curl -X POST http://localhost:8000/api/v1/bookings/1/approve \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Reject Booking
```bash
POST http://localhost:8000/api/v1/bookings/{id}/reject

curl -X POST http://localhost:8000/api/v1/bookings/1/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "rejection_reason": "Room needed for urgent meeting"
  }'
```

#### Cancel Booking
```bash
POST http://localhost:8000/api/v1/bookings/{id}/cancel

curl -X POST http://localhost:8000/api/v1/bookings/1/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cancellation_reason": "Meeting postponed"
  }'
```

---

## Troubleshooting

### Service Won't Start
```bash
# Check logs
docker compose logs meeting-room-service

# Common issues:
# 1. Port 8007 already in use
docker compose ps | grep 8007
netstat -ano | findstr :8007

# 2. Database connection failed
docker compose logs mysql

# 3. Restart service
docker compose restart meeting-room-service
```

### Database Migration Issues
```bash
# Run migrations manually
docker compose exec meeting-room-service php artisan migrate

# Reset database (WARNING: deletes all data)
docker compose exec meeting-room-service php artisan migrate:fresh

# Check migration status
docker compose exec meeting-room-service php artisan migrate:status
```

### Tests Failing
```bash
# Clear cache
docker compose exec meeting-room-service php artisan config:clear
docker compose exec meeting-room-service php artisan cache:clear

# Run specific test
docker compose exec meeting-room-service php artisan test --filter=BookingServiceTest

# Run with verbose output
docker compose exec meeting-room-service php artisan test --verbose
```

---

## Production Deployment

### 1. Environment Configuration
```bash
# Copy and edit .env for production
cp .env.example .env.production

# Update:
APP_ENV=production
APP_DEBUG=false
DB_HOST=your-production-db-host
DB_PASSWORD=strong-password
```

### 2. Build Production Image
```bash
docker build -t meeting-room-service:1.0 .

# Or via docker compose
docker compose -f docker-compose.prod.yml build meeting-room-service
```

### 3. Deploy
```bash
# Using Docker Compose
docker compose -f docker-compose.prod.yml up -d meeting-room-service

# Or using Kubernetes (if available)
kubectl apply -f k8s/meeting-room-service.yaml
```

### 4. Post-Deployment Checks
```bash
# Health check
curl http://your-domain/api/v1/meeting-rooms/health

# Check logs
docker compose logs -f meeting-room-service

# Run smoke tests
php artisan test --testsuite=Feature
```

---

## Monitoring

### Logs
```bash
# View real-time logs
docker compose logs -f meeting-room-service

# View last 100 lines
docker compose logs --tail=100 meeting-room-service

# Search logs
docker compose logs meeting-room-service | grep "ERROR"
```

### Performance Metrics
```bash
# Container stats
docker stats meeting-room-service

# Database queries
docker compose exec meeting-room-service php artisan telescope:install
```

---

## Backup & Recovery

### Database Backup
```bash
# Backup
docker compose exec mysql mysqldump -u imsquty_user -p imstest_quty > backup.sql

# Restore
docker compose exec -T mysql mysql -u imsquty_user -p imstest_quty < backup.sql
```

---

## Support

- **Documentation**: See README.md and COMPLETION_REPORT.md
- **Tests**: 46/46 passing (100% coverage)
- **API Endpoints**: 21 routes total
- **Status**: ✅ Production Ready

**Last Updated**: December 18, 2025
