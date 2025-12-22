# =========================================
# IMSQuty Microservices - Initialization Script
# Run this script to initialize the infrastructure
# =========================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "IMSQuty Microservices - Initialization" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker is running" -ForegroundColor Green
Write-Host ""

# Navigate to project directory
$projectPath = "D:\Project\ITQuty\imsquty-microservices"
if (!(Test-Path $projectPath)) {
    Write-Host "❌ ERROR: Project directory not found at $projectPath" -ForegroundColor Red
    exit 1
}
Set-Location $projectPath
Write-Host "📁 Working directory: $projectPath" -ForegroundColor Green
Write-Host ""

# Copy environment files if they don't exist
Write-Host "Setting up environment files..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env" -ForegroundColor Green
}
else {
    Write-Host "⚠️  .env already exists, skipping" -ForegroundColor Yellow
}

if (!(Test-Path "api-gateway\.env")) {
    Copy-Item "api-gateway\.env.example" "api-gateway\.env"
    Write-Host "✅ Created api-gateway/.env" -ForegroundColor Green
}
else {
    Write-Host "⚠️  api-gateway/.env already exists, skipping" -ForegroundColor Yellow
}
Write-Host ""

# Start infrastructure services
Write-Host "Starting infrastructure services..." -ForegroundColor Yellow
Write-Host "This will start: MySQL, Redis, RabbitMQ, MinIO, Mailhog" -ForegroundColor Cyan
Write-Host ""

docker compose up -d mysql redis rabbitmq minio mailhog

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Infrastructure services started" -ForegroundColor Green
}
else {
    Write-Host "❌ ERROR: Failed to start services" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Wait for MySQL to be ready
Write-Host "Waiting for MySQL to be ready..." -ForegroundColor Yellow
Write-Host "(This may take 30-60 seconds for first-time initialization)" -ForegroundColor Cyan

$maxAttempts = 30
$attempt = 0
$mysqlReady = $false

while ($attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "Attempt $attempt/$maxAttempts..." -NoNewline
    
    $result = docker compose exec -T mysql mysqladmin ping -h localhost 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅" -ForegroundColor Green
        $mysqlReady = $true
        break
    }
    
    Write-Host " ⏳" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

if (!$mysqlReady) {
    Write-Host ""
    Write-Host "❌ ERROR: MySQL failed to start after $maxAttempts attempts" -ForegroundColor Red
    Write-Host "Check logs with: docker compose logs mysql" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Verify database
Write-Host "Verifying database..." -ForegroundColor Yellow
$dbCheck = docker compose exec -T mysql mysql -u imsquty_user -pimsquty_pass_123 -e "SHOW DATABASES;" 2>$null
if ($dbCheck -match "imstest_quty") {
    Write-Host "✅ Database 'imstest_quty' created" -ForegroundColor Green
}
else {
    Write-Host "❌ ERROR: Database 'imstest_quty' not found" -ForegroundColor Red
    exit 1
}

# Count tables
Write-Host "Counting tables..." -ForegroundColor Yellow
$tableCount = docker compose exec -T mysql mysql -u imsquty_user -pimsquty_pass_123 imstest_quty -e "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'imstest_quty';" 2>$null
if ($tableCount -match "count") {
    $tables = ($tableCount -split "`n")[1].Trim()
    Write-Host "✅ Found $tables tables in database" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Could not count tables" -ForegroundColor Yellow
}
Write-Host ""

# Check Redis
Write-Host "Checking Redis..." -ForegroundColor Yellow
$redisCheck = docker compose exec -T redis redis-cli ping 2>$null
if ($redisCheck -match "PONG") {
    Write-Host "✅ Redis is ready" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Redis check failed" -ForegroundColor Yellow
}
Write-Host ""

# Check RabbitMQ
Write-Host "Checking RabbitMQ..." -ForegroundColor Yellow
$rabbitCheck = docker compose exec -T rabbitmq rabbitmq-diagnostics ping 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ RabbitMQ is ready" -ForegroundColor Green
}
else {
    Write-Host "⚠️  RabbitMQ check failed (may still be starting)" -ForegroundColor Yellow
}
Write-Host ""

# Show service status
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Service Status" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
docker compose ps
Write-Host ""

# Show access URLs
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Access URLs" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Infrastructure Services:" -ForegroundColor Yellow
Write-Host "  MySQL:             localhost:3306" -ForegroundColor White
Write-Host "    User:            imsquty_user" -ForegroundColor Gray
Write-Host "    Password:        imsquty_pass_123" -ForegroundColor Gray
Write-Host "    Database:        imstest_quty" -ForegroundColor Gray
Write-Host ""
Write-Host "  Redis:             localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "  RabbitMQ UI:       http://localhost:15672" -ForegroundColor White
Write-Host "    User:            imsquty" -ForegroundColor Gray
Write-Host "    Password:        rabbitmq_pass_123" -ForegroundColor Gray
Write-Host ""
Write-Host "  MinIO Console:     http://localhost:9001" -ForegroundColor White
Write-Host "    User:            minioadmin" -ForegroundColor Gray
Write-Host "    Password:        minioadmin123" -ForegroundColor Gray
Write-Host ""
Write-Host "  Mailhog:           http://localhost:8025" -ForegroundColor White
Write-Host ""
Write-Host "Default Admin User:" -ForegroundColor Yellow
Write-Host "  Username:          admin" -ForegroundColor White
Write-Host "  Email:             admin@quty.co.id" -ForegroundColor White
Write-Host "  Password:          123456" -ForegroundColor White
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Next Steps" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start API Gateway:" -ForegroundColor Yellow
Write-Host "   cd api-gateway" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor White
Write-Host "   cd .." -ForegroundColor White
Write-Host "   docker compose up -d api-gateway" -ForegroundColor White
Write-Host ""
Write-Host "2. Build Auth Service (see GETTING_STARTED.md)" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Access infrastructure UIs in your browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Check logs with:" -ForegroundColor Yellow
Write-Host "   docker compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Infrastructure Initialization Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Read GETTING_STARTED.md for detailed instructions" -ForegroundColor Cyan
Write-Host ""
