# Initialize Laravel for incomplete microservices
# This script creates proper Laravel structure for services that only have code folders

Write-Host "[START] Initializing Laravel for incomplete services..." -ForegroundColor Cyan
Write-Host ""

$servicesRoot = "D:\Project\ITQuty\imsquty-microservices\services"
$incompleteSvcs = @(
    "asset-service",
    "inventory-service", 
    "financial-service",
    "reporting-service",
    "notification-service"
)

foreach ($svc in $incompleteSvcs) {
    $svcPath = Join-Path $servicesRoot $svc
    $tempPath = Join-Path $servicesRoot "$svc-temp"
    $backupPath = Join-Path $servicesRoot "$svc-backup"
    
    Write-Host "[PROCESSING] $svc" -ForegroundColor Yellow
    
    # 1. Backup existing app folder
    if (Test-Path $svcPath) {
        Write-Host "  -> Backing up existing code..."
        Copy-Item -Path $svcPath -Destination $backupPath -Recurse -Force
    }
    
    # 2. Create Laravel in temp location
    Write-Host "  -> Creating Laravel project..."
    Set-Location $servicesRoot
    composer create-project laravel/laravel "$svc-temp" --prefer-dist --no-interaction --quiet
    
    if (-not (Test-Path $tempPath)) {
        Write-Host "  X Failed to create Laravel project" -ForegroundColor Red
        continue
    }
    
    # 3. Copy existing code back
    if (Test-Path "$backupPath\app") {
        Write-Host "  -> Restoring existing code..."
        
        # Remove default Laravel app folder
        Remove-Item -Path "$tempPath\app" -Recurse -Force
        
        # Copy back our code
        Copy-Item -Path "$backupPath\app" -Destination $tempPath -Recurse -Force
        
        # Copy routes if exist
        if (Test-Path "$backupPath\routes\api.php") {
            Copy-Item -Path "$backupPath\routes\api.php" -Destination "$tempPath\routes\api.php" -Force
        }
        
        # Copy tests if exist
        if (Test-Path "$backupPath\tests") {
            Remove-Item -Path "$tempPath\tests" -Recurse -Force -ErrorAction SilentlyContinue
            Copy-Item -Path "$backupPath\tests" -Destination $tempPath -Recurse -Force
        }
        
        # Copy database if exist
        if (Test-Path "$backupPath\database") {
            # Keep Laravel migrations, copy our factories/seeders
            if (Test-Path "$backupPath\database\factories") {
                Remove-Item -Path "$tempPath\database\factories" -Recurse -Force -ErrorAction SilentlyContinue
                Copy-Item -Path "$backupPath\database\factories" -Destination "$tempPath\database" -Recurse -Force
            }
            if (Test-Path "$backupPath\database\seeders") {
                Remove-Item -Path "$tempPath\database\seeders" -Recurse -Force -ErrorAction SilentlyContinue
                Copy-Item -Path "$backupPath\database\seeders" -Destination "$tempPath\database" -Recurse -Force
            }
        }
        
        # Copy storage folders if exist
        if (Test-Path "$backupPath\storage") {
            Copy-Item -Path "$backupPath\storage\*" -Destination "$tempPath\storage" -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    
    # 4. Replace old with new
    Write-Host "  -> Replacing old structure..."
    Remove-Item -Path $svcPath -Recurse -Force
    Rename-Item -Path $tempPath -NewName $svc
    
    # 5. Install additional dependencies
    Write-Host "  -> Installing dependencies..."
    Set-Location $svcPath
    composer require spatie/laravel-permission --no-interaction --quiet
    composer require predis/predis --no-interaction --quiet
    
    # 6. Create .env file
    if (-not (Test-Path "$svcPath\.env")) {
        Write-Host "  -> Creating .env file..."
        Copy-Item -Path "$svcPath\.env.example" -Destination "$svcPath\.env"
    }
    
    # 7. Generate app key
    Write-Host "  -> Generating app key..."
    php artisan key:generate --force --quiet
    
    Write-Host "  [OK] $svc initialized successfully!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "[SUCCESS] All services initialized!" -ForegroundColor Green
Write-Host ""
Write-Host "[NEXT] Next steps:" -ForegroundColor Cyan
Write-Host "  1. Configure .env files for each service"
Write-Host "  2. Update database connection settings"
Write-Host "  3. Run: php artisan config:clear in each service"
Write-Host "  4. Run tests to verify: php artisan test"
Write-Host ""

Set-Location $servicesRoot
