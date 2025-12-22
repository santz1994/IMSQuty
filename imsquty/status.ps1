# =========================================
# IMSQuty Microservices - Status Check Script
# Run this to check the status of all services
# =========================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "IMSQuty Microservices - Status Check" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "Docker Status:" -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker is running" -ForegroundColor Green
}
else {
    Write-Host "❌ Docker is NOT running" -ForegroundColor Red
}
Write-Host ""

# Check containers
Write-Host "Container Status:" -ForegroundColor Yellow
docker compose ps
Write-Host ""

# Check MySQL
Write-Host "MySQL Status:" -ForegroundColor Yellow
$mysqlCheck = docker compose exec -T mysql mysqladmin ping -h localhost 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ MySQL is running and responsive" -ForegroundColor Green
    
    # Check database
    $dbCheck = docker compose exec -T mysql mysql -u imsquty_user -pimsquty_pass_123 -e "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'imstest_quty';" 2>$null
    if ($dbCheck -match "count") {
        $tables = ($dbCheck -split "`n")[1].Trim()
        Write-Host "✅ Database 'imstest_quty' has $tables tables" -ForegroundColor Green
    }
    
    # Check users
    $userCheck = docker compose exec -T mysql mysql -u imsquty_user -pimsquty_pass_123 imstest_quty -e "SELECT COUNT(*) as count FROM users;" 2>$null
    if ($userCheck -match "count") {
        $users = ($userCheck -split "`n")[1].Trim()
        Write-Host "✅ Found $users user(s) in database" -ForegroundColor Green
    }
}
else {
    Write-Host "❌ MySQL is NOT responding" -ForegroundColor Red
}
Write-Host ""

# Check Redis
Write-Host "Redis Status:" -ForegroundColor Yellow
$redisCheck = docker compose exec -T redis redis-cli ping 2>$null
if ($redisCheck -match "PONG") {
    Write-Host "✅ Redis is running and responsive" -ForegroundColor Green
}
else {
    Write-Host "❌ Redis is NOT responding" -ForegroundColor Red
}
Write-Host ""

# Check RabbitMQ
Write-Host "RabbitMQ Status:" -ForegroundColor Yellow
$rabbitCheck = docker compose exec -T rabbitmq rabbitmq-diagnostics ping 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ RabbitMQ is running and responsive" -ForegroundColor Green
}
else {
    Write-Host "❌ RabbitMQ is NOT responding" -ForegroundColor Red
}
Write-Host ""

# Check MinIO
Write-Host "MinIO Status:" -ForegroundColor Yellow
try {
    $minioCheck = Invoke-WebRequest -Uri "http://localhost:9000/minio/health/live" -TimeoutSec 2 -UseBasicParsing 2>$null
    Write-Host "✅ MinIO is running and responsive" -ForegroundColor Green
}
catch {
    Write-Host "❌ MinIO is NOT responding" -ForegroundColor Red
}
Write-Host ""

# Check API Gateway
Write-Host "API Gateway Status:" -ForegroundColor Yellow
try {
    $gatewayCheck = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 2 2>$null
    if ($gatewayCheck.success -eq $true) {
        Write-Host "✅ API Gateway is running and responsive" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  API Gateway responded but with unexpected format" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ API Gateway is NOT responding" -ForegroundColor Red
}
Write-Host ""

# Service URLs
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Service URLs" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Infrastructure:" -ForegroundColor Yellow
Write-Host "  MySQL:          localhost:3306" -ForegroundColor White
Write-Host "  Redis:          localhost:6379" -ForegroundColor White
Write-Host "  RabbitMQ UI:    http://localhost:15672" -ForegroundColor White
Write-Host "  MinIO Console:  http://localhost:9001" -ForegroundColor White
Write-Host "  Mailhog:        http://localhost:8025" -ForegroundColor White
Write-Host ""
Write-Host "Application:" -ForegroundColor Yellow
Write-Host "  API Gateway:    http://localhost:8000" -ForegroundColor White
Write-Host "  Auth Service:   http://localhost:8001" -ForegroundColor White
Write-Host "  User Service:   http://localhost:8002" -ForegroundColor White
Write-Host "  Asset Service:  http://localhost:8003" -ForegroundColor White
Write-Host "  Ticket Service: http://localhost:8004" -ForegroundColor White
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Quick Commands" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "View logs:              docker compose logs -f" -ForegroundColor White
Write-Host "View service logs:      docker compose logs -f service-name" -ForegroundColor White
Write-Host "Restart service:        docker compose restart service-name" -ForegroundColor White
Write-Host "Stop all:               docker compose down" -ForegroundColor White
Write-Host "Start all:              docker compose up -d" -ForegroundColor White
Write-Host ""
