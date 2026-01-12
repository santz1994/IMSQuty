# ===================================================================
# ITQuty - Session 27: Run Database Migrations
# ===================================================================
# Description: Runs the new migration to add display_name to roles table
# Date: January 13, 2026
# ===================================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ITQuty - Database Migration Script" -ForegroundColor Cyan
Write-Host "  Session 27: Add display_name to roles" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Change to auth-service directory
$authServicePath = Join-Path $PSScriptRoot "services\auth-service"

if (-Not (Test-Path $authServicePath)) {
    Write-Host "❌ Error: Auth service directory not found: $authServicePath" -ForegroundColor Red
    exit 1
}

Set-Location $authServicePath
Write-Host "📂 Changed directory to: $authServicePath" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found in auth-service directory" -ForegroundColor Red
    Write-Host "   Please create .env file with database connection details" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔍 Checking database connection..." -ForegroundColor Yellow
Write-Host ""

# Test database connection
php artisan migrate:status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error: Cannot connect to database" -ForegroundColor Red
    Write-Host "   Please check your .env database configuration" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Database connection successful!" -ForegroundColor Green
Write-Host ""

# Show current migration status
Write-Host "📋 Current migration status:" -ForegroundColor Cyan
php artisan migrate:status
Write-Host ""

# Run migrations
Write-Host "🚀 Running migrations..." -ForegroundColor Yellow
Write-Host ""

php artisan migrate --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migrations completed successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Show updated migration status
    Write-Host "📋 Updated migration status:" -ForegroundColor Cyan
    php artisan migrate:status
    Write-Host ""
    
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "  ✅ Migration Complete!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Restart auth-service" -ForegroundColor White
    Write-Host "  2. Restart frontend admin-panel" -ForegroundColor White
    Write-Host "  3. Test Roles & Permissions page" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    Write-Host "   Please check the error message above" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Return to original directory
Set-Location $PSScriptRoot
