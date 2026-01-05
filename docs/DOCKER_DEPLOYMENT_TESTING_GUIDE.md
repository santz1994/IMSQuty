# 🐳 DOCKER DEPLOYMENT & LIVE TESTING GUIDE

**Purpose**: Complete guide for deploying all services and running comprehensive tests  
**Status**: Ready for Execution  
**Expected Duration**: 30-45 minutes for full deployment + testing  

---

## 🚀 QUICK START COMMANDS

### 1. Environment Setup

```bash
cd d:\Project\ITQuty\imsquty

# Verify .env is configured
type .env

# Required variables to check:
# DB_CONNECTION=mysql
# DB_HOST=mysql
# DB_PORT=3306
# DB_DATABASE=imsquty
# REDIS_HOST=redis
# REDIS_PORT=6379
# QUEUE_CONNECTION=rabbitmq
# RABBITMQ_HOST=rabbitmq
# MINIO_ENDPOINT=http://minio:9000
# MINIO_BUCKET=imsquty
# MINIO_REGION=us-east-1
```

### 2. Clean Start (Remove all containers)

```powershell
# Stop and remove all containers
docker-compose down --volumes --remove-orphans

# Remove dangling images
docker system prune -f

# Verify clean state
docker ps -a
```

### 3. Build Services

```powershell
# Build all services
docker-compose build --no-cache

# Expected build time: 3-5 minutes
# Watch for errors - report any failed builds
```

### 4. Start Services

```powershell
# Start in background
docker-compose up -d

# Wait for services to initialize
Start-Sleep -Seconds 30

# Check all services are running
docker-compose ps
```

### 5. Verify Health

```powershell
# Check API Gateway health
curl http://localhost:8000/api/v1/health

# Should return: {"status": "ok"}
```

---

## 📋 SERVICE VERIFICATION CHECKLIST

### Running Services (Should be 16 total)

- [ ] mysql (Port 3306)
- [ ] redis (Port 6379)
- [ ] rabbitmq (Port 5672, UI 15672)
- [ ] minio (Port 9000, UI 9001)
- [ ] api-gateway (Port 8000)
- [ ] auth-service (Port 8001)
- [ ] user-service (Port 8002)
- [ ] asset-service (Port 8003)
- [ ] ticket-service (Port 8004)
- [ ] inventory-service (Port 8005)
- [ ] financial-service (Port 8006)
- [ ] master-data-service (Port 8007)
- [ ] meeting-room-service (Port 8008)
- [ ] notification-service (Port 8009)
- [ ] reporting-service (Port 8010)
- [ ] elasticsearch (Port 9200) *optional*

### Verification Commands

```powershell
# Check container status
docker-compose ps

# Expected output: All 16 containers should show "Up"

# Check individual service logs
docker-compose logs api-gateway
docker-compose logs auth-service
docker-compose logs asset-service

# Check if API Gateway is responding
curl http://localhost:8000/api/v1/health
```

---

## 🧪 API ENDPOINT TESTING

### Authentication Flow

```bash
# 1. Register new user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!",
    "password_confirmation": "Password123!"
  }'

# Expected response: 
# {"status": "success", "message": "User registered", "data": {"token": "..."}}

# 2. Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'

# Save the token from response: TOKEN="..."

# 3. Get authenticated user
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Asset Management Endpoints

```bash
# Set token variable (replace with actual token from login)
$TOKEN = "your_jwt_token_here"

# 1. Get all assets (paginated, filtered)
curl -X GET "http://localhost:8000/api/v1/assets?page=1&per_page=10" \
  -H "Authorization: Bearer $TOKEN"

# 2. Create asset
curl -X POST http://localhost:8000/api/v1/assets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "asset_tag": "ASSET-001",
    "name": "Laptop Dell XPS",
    "serial_number": "ABC123456",
    "model_id": 1,
    "status_id": 1,
    "division_id": 1,
    "location_id": 1
  }'

# 3. Get specific asset
curl -X GET http://localhost:8000/api/v1/assets/1 \
  -H "Authorization: Bearer $TOKEN"

# 4. Update asset
curl -X PUT http://localhost:8000/api/v1/assets/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Updated Laptop Dell XPS",
    "status_id": 2
  }'

# 5. Delete asset
curl -X DELETE http://localhost:8000/api/v1/assets/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Ticket Management Endpoints

```bash
# Get all tickets
curl -X GET "http://localhost:8000/api/v1/tickets?page=1&per_page=10" \
  -H "Authorization: Bearer $TOKEN"

# Create ticket
curl -X POST http://localhost:8000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Network Cable Issue",
    "description": "Network connectivity problem",
    "priority": "high",
    "asset_id": 1,
    "status_id": 1
  }'

# Get specific ticket
curl -X GET http://localhost:8000/api/v1/tickets/1 \
  -H "Authorization: Bearer $TOKEN"

# Update ticket status
curl -X PUT http://localhost:8000/api/v1/tickets/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status_id": 2
  }'

# Delete ticket
curl -X DELETE http://localhost:8000/api/v1/tickets/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Master Data Endpoints

```bash
# Get locations (no auth required)
curl http://localhost:8000/api/v1/master-data/locations

# Get suppliers
curl http://localhost:8000/api/v1/master-data/suppliers

# Get manufacturers
curl http://localhost:8000/api/v1/master-data/manufacturers

# Get asset models
curl http://localhost:8000/api/v1/master-data/asset-models

# Get divisions
curl http://localhost:8000/api/v1/master-data/divisions
```

---

## 🌐 WEB FRONTEND TESTING

### Access Points

- **API Gateway**: http://localhost:8000
- **Web App**: http://localhost:3000
- **Admin Panel**: http://localhost:3001
- **RabbitMQ UI**: http://localhost:15672 (guest/guest)
- **MinIO UI**: http://localhost:9001 (minioadmin/minioadmin)

### Web App Test Scenarios

#### Scenario 1: Login & Dashboard
1. Navigate to http://localhost:3000
2. Click "Login"
3. Enter credentials:
   - Email: test@example.com
   - Password: Password123!
4. Verify dashboard displays with statistics
5. Check sidebar menu (Assets, Tickets, Admin)

#### Scenario 2: Asset Management (CREATE)
1. Navigate to Assets → New Asset
2. Fill form:
   - Asset Tag: TEST-ASSET-001
   - Name: Test Laptop
   - Serial Number: SN123456
   - Model: Select from dropdown
   - Status: Active
   - Division: Main Office
   - Location: IT Department
3. Click Save
4. Verify asset appears in list with success message

#### Scenario 3: Asset Management (READ)
1. Navigate to Assets
2. Search for "TEST-ASSET-001"
3. Click on asset row
4. Verify all fields display correctly
5. Check pagination works

#### Scenario 4: Asset Management (UPDATE)
1. Click Edit on an asset
2. Modify a field (e.g., name → "Updated Laptop")
3. Click Save
4. Verify list updates with new data

#### Scenario 5: Asset Management (DELETE)
1. Click Delete on an asset
2. Confirm deletion dialog
3. Verify asset removed from list

#### Scenario 6: Form Validation
1. Try to create asset without required fields
2. Verify error messages appear
3. Test invalid email format
4. Test special characters handling

#### Scenario 7: Search & Filter
1. Navigate to Assets
2. Search for "test"
3. Filter by Status = "Active"
4. Verify results are filtered correctly
5. Test pagination (if > 10 items)

#### Scenario 8: Error Handling
1. Disconnect network (or use browser dev tools)
2. Try to load assets
3. Verify error message displays
4. Reconnect and verify recovery

#### Scenario 9: Responsive Design (Desktop: 1920px)
1. Open web app in browser
2. Verify all elements visible
3. Check sidebar menu layout
4. Check data grid columns display properly
5. Check form layout

#### Scenario 10: Responsive Design (Tablet: 768px)
1. Resize browser to 768px width
2. Verify sidebar collapses/becomes drawer
3. Check data grid adapts (may show fewer columns)
4. Check form remains usable
5. Verify no horizontal scrolling

### Expected Results

- ✅ All forms submit successfully
- ✅ CRUD operations complete without errors
- ✅ Search & filter work correctly
- ✅ Error messages are clear & helpful
- ✅ Loading states visible during API calls
- ✅ Responsive design adapts to different screen sizes
- ✅ No console errors in browser

---

## 📱 MOBILE APP TESTING

### Android/iOS Setup

```bash
# 1. Navigate to mobile app
cd ..\frontend\mobile-app

# 2. Get dependencies
flutter pub get

# 3. Build for Android (emulator)
flutter build apk --debug

# 4. Build for iOS (simulator - macOS only)
flutter build ios --debug

# 5. Run on emulator
flutter run
```

### Mobile App Test Scenarios

#### Scenario 1: Splash Screen & Auto-Login
1. Run app
2. Verify splash screen shows (2 seconds)
3. Auto-login with stored credentials
4. Verify main screen loads

#### Scenario 2: Login Flow
1. Force logout (app settings)
2. Enter email: test@example.com
3. Enter password: Password123!
4. Tap Login
5. Verify home screen loads

#### Scenario 3: Asset List (READ)
1. Tap Assets from menu
2. Verify list loads with paginated data
3. Scroll down to load more items
4. Tap on asset to view detail

#### Scenario 4: Asset Detail
1. From asset list, tap an asset
2. Verify all fields display:
   - Asset Tag
   - Name
   - Serial Number
   - Status
   - Location
3. Scroll to see all information
4. Tap back to return to list

#### Scenario 5: Create New Asset (CREATE)
1. From asset list, tap + button
2. Fill form:
   - Asset Tag: MOBILE-001
   - Name: Mobile Test Asset
   - Serial Number: MO123456
   - Model: Select from dropdown
   - Status: Active
3. Tap Save
4. Verify success message
5. Verify asset appears in list

#### Scenario 6: Edit Asset (UPDATE)
1. From asset detail, tap Edit
2. Modify a field
3. Tap Save
4. Verify changes saved
5. Tap back to verify list updated

#### Scenario 7: Delete Asset (DELETE)
1. From asset detail, tap Delete
2. Confirm deletion
3. Verify asset removed from list

#### Scenario 8: Ticket Management
1. Repeat Scenarios 3-7 for Tickets

#### Scenario 9: Offline Mode
1. Enable airplane mode
2. Verify cached data still displays
3. Disable airplane mode
4. Verify sync occurs

#### Scenario 10: Navigation
1. Test bottom navigation tabs
2. Verify each screen loads correctly
3. Test drawer menu (if applicable)

---

## 🏢 ADMIN PANEL TESTING

### Access Admin Panel

- URL: http://localhost:3001
- Login with admin account (if created)

### Admin Panel Test Scenarios

#### Scenario 1: System Settings
1. Navigate to Settings
2. View app configuration
3. Test updating settings (app name, etc.)
4. Verify changes persist

#### Scenario 2: Audit Logs
1. Navigate to Audit Logs
2. Verify log entries display with:
   - User name
   - Action (create, update, delete)
   - Table name
   - Timestamp
3. Test filter by user/action/table
4. Test CSV export

#### Scenario 3: Roles & Permissions
1. Navigate to Roles & Permissions
2. Verify existing roles display
3. View role details
4. Edit permissions (check/uncheck)
5. Save changes
6. Verify applied to users

#### Scenario 4: User Management (if available)
1. View all users
2. Edit user role
3. Disable/enable user
4. Verify changes reflected

---

## 📊 PERFORMANCE TESTING

### Load Testing Script (PowerShell)

```powershell
# Test API response times
$token = "your_jwt_token"
$results = @()

for ($i = 1; $i -le 10; $i++) {
    $start = [DateTime]::Now
    
    $response = curl -s http://localhost:8000/api/v1/assets `
        -H "Authorization: Bearer $token"
    
    $elapsed = ([DateTime]::Now - $start).TotalMilliseconds
    
    $results += [PSCustomObject]@{
        Request = $i
        Time_ms = $elapsed
        Status = $response.Count
    }
}

# Display results
$results | Format-Table -AutoSize
Write-Host "Average response time: $($results.Time_ms | Measure-Object -Average | Select -ExpandProperty Average) ms"
```

### Expected Performance

- API Response Time: < 200ms (average)
- Page Load Time: < 2 seconds
- Database Query Time: < 100ms
- Asset List Pagination: < 500ms for 1000+ items

---

## 🔍 TROUBLESHOOTING

### Services Not Starting

```powershell
# Check Docker daemon
docker --version

# Restart Docker
docker-compose down
docker-compose up -d

# Check logs for errors
docker-compose logs --tail=50 api-gateway
docker-compose logs --tail=50 mysql
```

### Database Connection Issues

```powershell
# Check MySQL is running
docker ps | grep mysql

# Connect to MySQL directly
docker-compose exec mysql mysql -u root -ppassword -D imsquty -e "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='imsquty'"

# Check migrations ran
docker-compose exec api-gateway php artisan migrate:status
```

### API Gateway Not Responding

```powershell
# Check API Gateway logs
docker-compose logs api-gateway

# Restart API Gateway
docker-compose restart api-gateway

# Verify service is listening
curl http://localhost:8000/api/v1/health
```

### Frontend Cannot Connect to API

```powershell
# Check API Gateway is running
docker ps | grep api-gateway

# Verify CORS is enabled
# Check .env file for API_URL configuration

# Test direct API connection
curl http://localhost:8000/api/v1/health
```

---

## 📝 TEST RESULTS DOCUMENTATION

**Use this template to document test results**:

```
## Test Session: [DATE TIME]

### Environment
- Host OS: Windows
- Docker Version: [version]
- Services Running: [count]/16

### API Testing Results
- Authentication: [✅ PASS / ❌ FAIL]
  - Login endpoint: [✅ PASS / ❌ FAIL]
  - Token generation: [✅ PASS / ❌ FAIL]
  - Auth header validation: [✅ PASS / ❌ FAIL]

- Asset Endpoints: [✅ PASS / ❌ FAIL]
  - GET /assets: [✅ PASS / ❌ FAIL]
  - POST /assets: [✅ PASS / ❌ FAIL]
  - PUT /assets/{id}: [✅ PASS / ❌ FAIL]
  - DELETE /assets/{id}: [✅ PASS / ❌ FAIL]

- Ticket Endpoints: [✅ PASS / ❌ FAIL]
  - [same as assets]

- Master Data Endpoints: [✅ PASS / ❌ FAIL]
  - GET /master-data/locations: [✅ PASS / ❌ FAIL]
  - GET /master-data/suppliers: [✅ PASS / ❌ FAIL]

### Web Frontend Testing Results
- Login & Dashboard: [✅ PASS / ❌ FAIL]
- Asset CRUD Operations: [✅ PASS / ❌ FAIL]
- Ticket CRUD Operations: [✅ PASS / ❌ FAIL]
- Search & Filter: [✅ PASS / ❌ FAIL]
- Error Handling: [✅ PASS / ❌ FAIL]
- Responsive Design (Desktop): [✅ PASS / ❌ FAIL]
- Responsive Design (Tablet): [✅ PASS / ❌ FAIL]
- Form Validation: [✅ PASS / ❌ FAIL]

### Mobile App Testing Results
- Build Success: [✅ PASS / ❌ FAIL]
- Login Flow: [✅ PASS / ❌ FAIL]
- Asset CRUD: [✅ PASS / ❌ FAIL]
- Navigation: [✅ PASS / ❌ FAIL]

### Admin Panel Testing Results
- System Settings: [✅ PASS / ❌ FAIL]
- Audit Logs: [✅ PASS / ❌ FAIL]
- Roles & Permissions: [✅ PASS / ❌ FAIL]

### Performance Testing Results
- API Average Response Time: [XXX ms]
- Database Query Time: [XXX ms]
- Page Load Time: [XXX seconds]
- Issues: [None / List issues]

### Issues Found
1. [Issue description] - Severity: [Low/Medium/High]
2. [Issue description] - Severity: [Low/Medium/High]

### Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

### Overall Result: [✅ READY FOR PRODUCTION / ❌ NEEDS FIXES / ⚠️ NEEDS REVIEW]
```

---

## ✅ TESTING COMPLETION CHECKLIST

- [ ] Docker services started successfully (16/16)
- [ ] API Gateway responding to health check
- [ ] Authentication flow working (register, login, me)
- [ ] Asset CRUD operations working
- [ ] Ticket CRUD operations working
- [ ] Master data endpoints returning data
- [ ] Web app loads and authenticates
- [ ] Web app CRUD operations working
- [ ] Web app search & filter working
- [ ] Web app responsive on desktop (1920px)
- [ ] Web app responsive on tablet (768px)
- [ ] Admin panel loads and displays data
- [ ] Mobile app builds successfully
- [ ] Mobile app connects to API
- [ ] All error messages display correctly
- [ ] No console errors in browsers
- [ ] Performance acceptable (< 200ms API response)
- [ ] Load testing completed

---

**Ready for Testing**: Yes ✅  
**Expected Start Time**: [Set time]  
**Expected Duration**: 45-60 minutes  
**Responsible Person**: [Name]  
**Target Completion**: [Set date]  

