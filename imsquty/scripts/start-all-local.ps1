# Start all microservices locally (No Docker required)
# Services run on localhost:8001-8010

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

$baseDir = "d:\Project\ITQuty\imsquty\services"
$jobs = @()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STARTING ALL MICROSERVICES LOCALLY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($service in $services) {
    $servicePath = "$baseDir\$($service.name)"
    $port = $service.port
    
    Write-Host "Starting $($service.name) on port $port..." -ForegroundColor Yellow
    
    $job = Start-Job -ScriptBlock {
        param($path, $port, $name)
        cd $path
        $env:APP_PORT = $port
        php artisan serve --port=$port 2>&1 | Tee-Object -FilePath "service-$name.log"
    } -ArgumentList $servicePath, $port, $service.name
    
    $jobs += $job
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "ALL SERVICES STARTED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services running on:"
foreach ($service in $services) {
    Write-Host "  - $($service.name): http://localhost:$($service.port)" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "API Gateway: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend Web: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend Admin: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop all services, run: Stop-Job -Job (Get-Job)" -ForegroundColor Yellow
Write-Host ""

# Keep running
Write-Host "Services are running. Press Ctrl+C to stop." -ForegroundColor Magenta
Get-Job | Wait-Job
