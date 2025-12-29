# Health check script - Verify all services are responding

$services = @(
    @{ name = 'auth-service'; port = 8001 },
    @{ name = 'user-service'; port = 8002 },
    @{ name = 'asset-service'; port = 8003 },
    @{ name = 'ticket-service'; port = 8004 },
    @{ name = 'inventory-service'; port = 8005 },
    @{ name = 'financial-service'; port = 8006 },
    @{ name = 'master-data-service'; port = 8007 },
    @{ name = 'notification-service'; port = 8008 },
    @{ name = 'meeting-room-service'; port = 8009 },
    @{ name = 'reporting-service'; port = 8010 }
)

$apiGateway = @{ name = 'api-gateway'; port = 8000 }

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HEALTH CHECK - ALL SERVICES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check API Gateway
Write-Host "Checking API Gateway..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$($apiGateway.port)/health" -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ API Gateway is running" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ API Gateway is NOT responding" -ForegroundColor Red
}

Write-Host ""

# Check all microservices
$healthy = 0
$total = $services.Count

foreach ($service in $services) {
    $port = $service.port
    $name = $service.name
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port/" -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✓ $name (port $port) is responding" -ForegroundColor Green
        $healthy++
    } catch {
        Write-Host "✗ $name (port $port) is NOT responding" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUMMARY: $healthy/$total services responding" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($healthy -eq $total) {
    Write-Host "All services are HEALTHY!" -ForegroundColor Green
} else {
    Write-Host "Some services are DOWN. Check logs:" -ForegroundColor Yellow
    Write-Host "  ls service-*.log" -ForegroundColor Yellow
}
