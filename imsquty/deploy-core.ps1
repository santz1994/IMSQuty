# =========================================
# IMSQuty Microservices - Deploy Core Services
# Deploy the 4 completed microservices
# =========================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "IMSQuty - Deploy Core Services" -ForegroundColor Cyan
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
$projectPath = "D:\Project\ITQuty\itquty-microservices"
if (!(Test-Path $projectPath)) {
    Write-Host "❌ ERROR: Project directory not found at $projectPath" -ForegroundColor Red
    exit 1
}
Set-Location $projectPath
Write-Host "📁 Working directory: $projectPath" -ForegroundColor Green
Write-Host ""

# Build and start core services
Write-Host "Building and starting core services..." -ForegroundColor Yellow
Write-Host "Services: API Gateway, Auth, User, Ticket, Meeting Room" -ForegroundColor Cyan
Write-Host ""

# Build the services
Write-Host "Step 1: Building Docker images..." -ForegroundColor Yellow
docker compose build api-gateway auth-service user-service ticket-service meeting-room-service

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completed" -ForegroundColor Green
Write-Host ""

# Start the services
Write-Host "Step 2: Starting services..." -ForegroundColor Yellow
docker compose up -d api-gateway auth-service user-service ticket-service meeting-room-service

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Failed to start services!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Services started" -ForegroundColor Green
Write-Host ""

# Wait for services to be ready
Write-Host "Step 3: Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test each service
Write-Host ""
Write-Host "Testing Service Health:" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan

# Test API Gateway
Write-Host "1. API Gateway (Port 8000)..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 3
    if ($response.success) {
        Write-Host " ✅" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  Unexpected response" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ❌ Not responding" -ForegroundColor Red
}

# Test Auth Service
Write-Host "2. Auth Service (Port 8001)..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8001/health" -TimeoutSec 3
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not responding" -ForegroundColor Red
}

# Test User Service
Write-Host "3. User Service (Port 8002)..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8002/health" -TimeoutSec 3
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not responding" -ForegroundColor Red
}

# Test Ticket Service
Write-Host "4. Ticket Service (Port 8004)..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8004/health" -TimeoutSec 3
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not responding" -ForegroundColor Red
}

# Test Meeting Room Service
Write-Host "5. Meeting Room Service (Port 8007)..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8007/health" -TimeoutSec 3
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ❌ Not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Core Services Deployed!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service Endpoints:" -ForegroundColor Yellow
Write-Host "  API Gateway:    http://localhost:8000" -ForegroundColor White
Write-Host "  Auth Service:   http://localhost:8001" -ForegroundColor White
Write-Host "  User Service:   http://localhost:8002" -ForegroundColor White
Write-Host "  Ticket Service: http://localhost:8004" -ForegroundColor White
Write-Host "  Meeting Room:   http://localhost:8007" -ForegroundColor White
Write-Host ""
Write-Host "Management UIs:" -ForegroundColor Yellow
Write-Host "  RabbitMQ:  http://localhost:15672 (user: imsquty, pass: rabbitmq_pass_123)" -ForegroundColor White
Write-Host "  MinIO:     http://localhost:9001 (user: minioadmin, pass: minioadmin123)" -ForegroundColor White
Write-Host "  Mailhog:   http://localhost:8025" -ForegroundColor White
Write-Host ""
Write-Host "Check full status: .\status.ps1" -ForegroundColor Cyan
Write-Host "View logs: docker compose logs -f [service-name]" -ForegroundColor Cyan
Write-Host ""
