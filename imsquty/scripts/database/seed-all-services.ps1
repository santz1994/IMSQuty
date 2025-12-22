# Seed All Services - Populate test data
# Date: December 19, 2025

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Seeding All Microservices" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$services = @(
    "master-data-service",  # Seed first (foundation data)
    "user-service",         # Users and roles
    "auth-service",         # Auth data
    "asset-service",        # Assets
    "inventory-service",    # Inventory
    "financial-service",    # Financial
    "ticket-service",       # Tickets
    "meeting-room-service", # Meeting rooms
    "reporting-service",    # Reports
    "notification-service"  # Notifications
)

foreach ($service in $services) {
    $servicePath = "services\$service"
    
    if (Test-Path $servicePath) {
        Write-Host "Seeding $service..." -ForegroundColor Cyan
        
        Push-Location $servicePath
        
        # Run seeder
        php artisan db:seed --force 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Seeding completed" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Seeding skipped or failed" -ForegroundColor Yellow
        }
        
        Pop-Location
        Write-Host ""
    }
}

Write-Host "===============================================" -ForegroundColor Green
Write-Host "✅ SEEDING COMPLETE" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
