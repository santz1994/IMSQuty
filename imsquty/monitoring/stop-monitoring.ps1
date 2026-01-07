# PowerShell Script to Stop IMSQuty Monitoring Stack

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " IMSQuty Monitoring Stack Shutdown" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Stopping monitoring services..." -ForegroundColor Yellow
docker-compose down

Write-Host ""
Write-Host "✓ All monitoring services stopped" -ForegroundColor Green
Write-Host ""

# Ask if user wants to remove volumes
Write-Host "Do you want to remove persistent data volumes? (y/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq 'y' -or $response -eq 'Y') {
    Write-Host "Removing volumes..." -ForegroundColor Yellow
    docker-compose down -v
    Write-Host "✓ Volumes removed" -ForegroundColor Green
} else {
    Write-Host "Volumes preserved for next startup" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Monitoring Stack Stopped" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
