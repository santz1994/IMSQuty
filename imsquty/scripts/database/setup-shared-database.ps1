# IMSQuty Microservices - Database Setup Script
# Phase 1: Shared MySQL Database (per 04_DATABASE_STRATEGY.md)
# Date: December 19, 2025

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "IMSQuty Microservices - Database Setup" -ForegroundColor Cyan
Write-Host "Phase 1: Shared MySQL Database" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Database Configuration
$DB_NAME = "imsquty_microservices"
$DB_USER = "root"
$DB_HOST = "127.0.0.1"
$DB_PORT = "3306"

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Name: $DB_NAME" -ForegroundColor White
Write-Host "  Host: $DB_HOST" -ForegroundColor White
Write-Host "  Port: $DB_PORT" -ForegroundColor White
Write-Host "  User: $DB_USER" -ForegroundColor White
Write-Host ""

# Prompt for MySQL password
$DB_PASSWORD = Read-Host "Enter MySQL root password" -AsSecureString
$DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD))

Write-Host ""
Write-Host "Step 1: Testing MySQL connection..." -ForegroundColor Yellow

# Test MySQL connection
$testConnection = "mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASSWORD_PLAIN -e 'SELECT 1;' 2>&1"
$result = Invoke-Expression $testConnection

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Cannot connect to MySQL!" -ForegroundColor Red
    Write-Host "Please ensure MySQL is running and credentials are correct." -ForegroundColor Red
    exit 1
}

Write-Host "✅ MySQL connection successful!" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Creating database '$DB_NAME'..." -ForegroundColor Yellow

# Create database
$createDb = @"
CREATE DATABASE IF NOT EXISTS ``$DB_NAME`` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
"@

$createDbCmd = "mysql -h$DB_HOST -P$DB_PORT -u$DB_USER -p$DB_PASSWORD_PLAIN -e `"$createDb`" 2>&1"
Invoke-Expression $createDbCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database created successfully!" -ForegroundColor Green
}
else {
    Write-Host "❌ ERROR: Failed to create database!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Configuring all services..." -ForegroundColor Yellow

# List of all services
$services = @(
    "auth-service",
    "user-service",
    "asset-service",
    "ticket-service",
    "inventory-service",
    "financial-service",
    "meeting-room-service",
    "master-data-service",
    "reporting-service",
    "notification-service"
)

$servicePort = 8001

foreach ($service in $services) {
    $servicePath = "services\$service"
    
    if (Test-Path $servicePath) {
        Write-Host "  Configuring $service (Port: $servicePort)..." -ForegroundColor Cyan
        
        # Copy .env.example to .env if not exists
        if (-not (Test-Path "$servicePath\.env")) {
            Copy-Item "$servicePath\.env.example" "$servicePath\.env"
        }
        
        # Update .env file with correct database settings
        $envContent = Get-Content "$servicePath\.env" -Raw
        
        # Update database configuration
        $envContent = $envContent -replace 'DB_DATABASE=.*', "DB_DATABASE=$DB_NAME"
        $envContent = $envContent -replace 'DB_HOST=.*', "DB_HOST=$DB_HOST"
        $envContent = $envContent -replace 'DB_PORT=.*', "DB_PORT=$DB_PORT"
        $envContent = $envContent -replace 'DB_USERNAME=.*', "DB_USERNAME=$DB_USER"
        $envContent = $envContent -replace 'DB_PASSWORD=.*', "DB_PASSWORD=$DB_PASSWORD_PLAIN"
        
        # Update APP_URL with correct port
        $envContent = $envContent -replace 'APP_URL=.*', "APP_URL=http://localhost:$servicePort"
        
        # Save updated .env
        Set-Content "$servicePath\.env" $envContent
        
        Write-Host "    ✅ Configuration updated" -ForegroundColor Green
        
        $servicePort++
    }
}

Write-Host ""
Write-Host "Step 4: Generating application keys..." -ForegroundColor Yellow

foreach ($service in $services) {
    $servicePath = "services\$service"
    
    if (Test-Path $servicePath) {
        Write-Host "  Generating key for $service..." -ForegroundColor Cyan
        
        Push-Location $servicePath
        php artisan key:generate --force 2>&1 | Out-Null
        Pop-Location
        
        Write-Host "    ✅ Key generated" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Step 5: Running migrations for all services..." -ForegroundColor Yellow
Write-Host ""

$migrationResults = @()

foreach ($service in $services) {
    $servicePath = "services\$service"
    
    if (Test-Path $servicePath) {
        Write-Host "  Migrating $service..." -ForegroundColor Cyan
        
        Push-Location $servicePath
        
        # Run migration
        $output = php artisan migrate --force 2>&1
        $success = $LASTEXITCODE -eq 0
        
        Pop-Location
        
        if ($success) {
            Write-Host "    ✅ Migration completed" -ForegroundColor Green
            $migrationResults += [PSCustomObject]@{
                Service    = $service
                Status     = "✅ Success"
                Migrations = ($output | Select-String "Migrated:").Count
            }
        }
        else {
            Write-Host "    ❌ Migration failed" -ForegroundColor Red
            $migrationResults += [PSCustomObject]@{
                Service    = $service
                Status     = "❌ Failed"
                Migrations = 0
            }
        }
    }
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Migration Summary" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$migrationResults | Format-Table -AutoSize

$successCount = ($migrationResults | Where-Object { $_.Status -eq "✅ Success" }).Count
$totalCount = $migrationResults.Count

Write-Host ""
Write-Host "Results: $successCount/$totalCount services migrated successfully" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })
Write-Host ""

if ($successCount -eq $totalCount) {
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host "✅ DATABASE SETUP COMPLETE!" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Run tests: .\scripts\database\test-all-services.ps1" -ForegroundColor White
    Write-Host "2. Seed data: .\scripts\database\seed-all-services.ps1" -ForegroundColor White
    Write-Host "3. Start services: .\scripts\development\start-all-services.ps1" -ForegroundColor White
}
else {
    Write-Host "===============================================" -ForegroundColor Yellow
    Write-Host "⚠️ SOME MIGRATIONS FAILED" -ForegroundColor Yellow
    Write-Host "===============================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please check the error messages above and fix issues." -ForegroundColor Yellow
}

Write-Host ""
