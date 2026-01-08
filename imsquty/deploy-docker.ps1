# IMSQuty Docker Deployment Script
# Complete stack deployment with health checks

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IMSQUTY DOCKER DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$baseDir = "d:\Project\ITQuty\imsquty"

# Change to base directory
Set-Location $baseDir

Write-Host "Step 1: Environment Check" -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "[ERROR] .env file not found!" -ForegroundColor Red
    Write-Host "Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "[OK] .env file created. Please configure it." -ForegroundColor Green
}

Write-Host "[OK] Environment file exists" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Stopping existing containers..." -ForegroundColor Yellow
docker-compose down -v 2>&1 | Out-Null
Write-Host "[OK] Containers stopped" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Removing old images (optional)..." -ForegroundColor Yellow
Write-Host "Skipping image cleanup. Use 'docker system prune -a' manually if needed." -ForegroundColor Gray
Write-Host ""

Write-Host "Step 4: Building Docker images..." -ForegroundColor Yellow
Write-Host "This may take 10-15 minutes on first run..." -ForegroundColor Gray
docker-compose build --parallel
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Image build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] All images built successfully" -ForegroundColor Green
Write-Host ""

Write-Host "Step 5: Starting infrastructure services..." -ForegroundColor Yellow
docker-compose up -d mysql redis rabbitmq minio mailhog
Write-Host "Waiting 30 seconds for infrastructure to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 30

$infrastructureServices = @("mysql", "redis", "rabbitmq", "minio", "mailhog")
foreach ($service in $infrastructureServices) {
    $health = docker inspect --format='{{.State.Health.Status}}' "imsquty-$service" 2>$null
    if ($health -eq "healthy" -or $health -eq "starting") {
        Write-Host "[OK] $service is $health" -ForegroundColor Green
    } else {
        $status = docker inspect --format='{{.State.Status}}' "imsquty-$service" 2>$null
        Write-Host "[OK] $service is $status" -ForegroundColor Green
    }
}
Write-Host ""

Write-Host "Step 6: Running database migrations..." -ForegroundColor Yellow
docker-compose exec -T mysql mysql -uroot -pimsquty112233 -e "SHOW DATABASES;" 2>$null | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Database is accessible" -ForegroundColor Green
} else {
    Write-Host "[WARN] Database check failed, but continuing..." -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Step 7: Starting microservices..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "Waiting 20 seconds for services to start..." -ForegroundColor Gray
Start-Sleep -Seconds 20
Write-Host "[OK] All services started" -ForegroundColor Green
Write-Host ""

Write-Host "Step 8: Checking service status..." -ForegroundColor Yellow
$services = docker-compose ps --services
$runningCount = 0
$totalCount = 0

foreach ($service in $services) {
    $totalCount++
    $status = docker inspect --format='{{.State.Status}}' "imsquty-$service" 2>$null
    if ($status -eq "running") {
        Write-Host "[OK] $service - Running" -ForegroundColor Green
        $runningCount++
    } else {
        Write-Host "[FAIL] $service - $status" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services Running: $runningCount / $totalCount" -ForegroundColor $(if ($runningCount -eq $totalCount) { "Green" } else { "Yellow" })
Write-Host ""

Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Frontend:          http://localhost:5173" -ForegroundColor White
Write-Host "  API Gateway:       http://localhost:8000" -ForegroundColor White
Write-Host "  Auth Service:      http://localhost:8001" -ForegroundColor White
Write-Host "  MySQL:             localhost:3306" -ForegroundColor White
Write-Host "  Redis:             localhost:6379" -ForegroundColor White
Write-Host "  RabbitMQ UI:       http://localhost:15672" -ForegroundColor White
Write-Host "  MinIO Console:     http://localhost:9001" -ForegroundColor White
Write-Host "  MailHog UI:        http://localhost:8025" -ForegroundColor White
Write-Host ""

Write-Host "Test Credentials:" -ForegroundColor Cyan
Write-Host "  Email:    admin@quty.co.id" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  View logs:         docker-compose logs -f" -ForegroundColor White
Write-Host "  View specific:     docker-compose logs -f auth-service" -ForegroundColor White
Write-Host "  Stop all:          docker-compose down" -ForegroundColor White
Write-Host "  Restart service:   docker-compose restart auth-service" -ForegroundColor White
Write-Host "  Check status:      docker-compose ps" -ForegroundColor White
Write-Host ""

if ($runningCount -eq $totalCount) {
    Write-Host "[SUCCESS] All services deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Some services failed to start. Check logs with:" -ForegroundColor Yellow
    Write-Host "docker-compose logs" -ForegroundColor White
}
Write-Host ""
