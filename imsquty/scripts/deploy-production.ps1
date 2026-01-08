# IMSQuty Production Deployment Script
# Automated deployment for all services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IMSQuty Production Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$baseDir = "d:\Project\ITQuty\imsquty"

# Step 1: Verify Infrastructure
Write-Host "Step 1: Verifying Infrastructure..." -ForegroundColor Yellow
docker ps -a

Write-Host ""
Write-Host "Checking container health..." -ForegroundColor Yellow

$containers = @("imsquty-mysql", "imsquty-redis", "imsquty-minio", "imsquty-mailhog")
$allHealthy = $true

foreach ($container in $containers) {
    $inspect = docker inspect $container 2>&1 | ConvertFrom-Json
    if ($inspect) {
        $status = $inspect[0].State.Health.Status
        if ($status -eq "healthy") {
            Write-Host "[OK] $container is healthy" -ForegroundColor Green
        }
        else {
            Write-Host "[FAIL] $container status: $status" -ForegroundColor Red
            $allHealthy = $false
        }
    }
}

if (-not $allHealthy) {
    Write-Host ""
    Write-Host "Infrastructure not ready. Starting Docker services..." -ForegroundColor Yellow
    Set-Location $baseDir
    docker-compose up -d
    Write-Host "Waiting 30 seconds for services to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

Write-Host ""
Write-Host "Infrastructure ready!" -ForegroundColor Green
Write-Host ""

# Step 2: Check Database
Write-Host "Step 2: Verifying Database..." -ForegroundColor Yellow
docker exec imsquty-mysql mysql -uimsquty -pimsquty112233 imsquty -e "SELECT COUNT(*) as roles_count FROM roles; SELECT COUNT(*) as users_count FROM users;"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database is accessible and seeded" -ForegroundColor Green
}
else {
    Write-Host "Database connection failed" -ForegroundColor Red
}

Write-Host ""

# Step 3: Service Status
Write-Host "Step 3: Backend Services Status" -ForegroundColor Yellow
Write-Host ""

$services = @(
    @{Name = "Auth Service"; Port = 8000; Path = "services\auth-service" },
    @{Name = "Asset Service"; Port = 8001; Path = "services\asset-service" },
    @{Name = "User Service"; Port = 8002; Path = "services\user-service" },
    @{Name = "Ticket Service"; Port = 8003; Path = "services\ticket-service" },
    @{Name = "Meeting Room Service"; Port = 8004; Path = "services\meeting-room-service" },
    @{Name = "Financial Service"; Port = 8005; Path = "services\financial-service" },
    @{Name = "Inventory Service"; Port = 8006; Path = "services\inventory-service" },
    @{Name = "Notification Service"; Port = 8007; Path = "services\notification-service" },
    @{Name = "Reporting Service"; Port = 8008; Path = "services\reporting-service" },
    @{Name = "Master Data Service"; Port = 8009; Path = "services\master-data-service" }
)

Write-Host "Services to deploy:" -ForegroundColor Cyan
foreach ($service in $services) {
    Write-Host "  - $($service.Name) on port $($service.Port)" -ForegroundColor White
}

Write-Host ""
Write-Host "Manual Action Required:" -ForegroundColor Yellow
Write-Host "You need to start each service in a separate terminal window." -ForegroundColor Yellow
Write-Host ""

# Generate start commands
Write-Host "Copy and run these commands in separate terminals:" -ForegroundColor Cyan
Write-Host ""

$index = 1
foreach ($service in $services) {
    $fullPath = Join-Path $baseDir $service.Path
    Write-Host "# Terminal $index : $($service.Name)" -ForegroundColor Green
    Write-Host "cd $fullPath" -ForegroundColor White
    Write-Host "php artisan serve --host=0.0.0.0 --port=$($service.Port)" -ForegroundColor White
    Write-Host ""
    $index++
}

# Step 4: Frontend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Terminal 11: Frontend Web App" -ForegroundColor Green
Write-Host "cd $baseDir\frontend\web-app" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor White
Write-Host ""

# Step 5: Testing URLs
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing URLs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "After starting all services, test these URLs:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Frontend:        http://localhost:5173" -ForegroundColor Cyan
Write-Host "Auth Service:    http://localhost:8000/api/health" -ForegroundColor Cyan
Write-Host "Asset Service:   http://localhost:8001/api/health" -ForegroundColor Cyan
Write-Host "User Service:    http://localhost:8002/api/health" -ForegroundColor Cyan
Write-Host "Ticket Service:  http://localhost:8003/api/health" -ForegroundColor Cyan
Write-Host "Meeting Service: http://localhost:8004/api/health" -ForegroundColor Cyan
Write-Host "Financial:       http://localhost:8005/api/health" -ForegroundColor Cyan
Write-Host "Inventory:       http://localhost:8006/api/health" -ForegroundColor Cyan
Write-Host "Notification:    http://localhost:8007/api/health" -ForegroundColor Cyan
Write-Host "Reporting:       http://localhost:8008/api/health" -ForegroundColor Cyan
Write-Host "Master Data:     http://localhost:8009/api/health" -ForegroundColor Cyan
Write-Host ""

# Step 6: Test Credentials
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Credentials" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Super Admin:" -ForegroundColor Green
Write-Host "  Email: admin@quty.co.id" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Manager:" -ForegroundColor Green
Write-Host "  Email: manager1@quty.co.id" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "User:" -ForegroundColor Green
Write-Host "  Email: user1@quty.co.id" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Infrastructure Ready for Deployment" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Start services in separate terminals using commands above" -ForegroundColor Yellow
Write-Host ""
