# ===========================================================
# SESSION 28 - DEVELOPER ROLE HIERARCHY DEPLOYMENT
# ===========================================================
# Purpose: Deploy Developer role with hierarchy system
# Created: January 14, 2026
# Developer: Daniel Rizaldy
# ===========================================================

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " SESSION 28: DEVELOPER ROLE DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# ===========================================================
# STEP 1: CHECK DATABASE CONNECTION
# ===========================================================
Write-Host "[1/5] Checking database connection..." -ForegroundColor Yellow

Set-Location "d:\Project\ITQuty\imsquty\services\auth-service"

try {
    $dbCheck = php artisan db:show 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Database connected!" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Database not connected!" -ForegroundColor Red
        Write-Host "  Please configure .env file first" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "  [ERROR] Cannot check database: $_" -ForegroundColor Red
    exit 1
}

# ===========================================================
# STEP 2: RUN SESSION 27 MIGRATION (display_name)
# ===========================================================
Write-Host ""
Write-Host "[2/5] Running Session 27 migration (display_name)..." -ForegroundColor Yellow

php artisan migrate --path=database/migrations/2026_01_13_add_display_name_to_roles.php --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Session 27 migration completed!" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Session 27 migration may have already run" -ForegroundColor Yellow
}

# ===========================================================
# STEP 3: RUN SESSION 28 MIGRATION (level hierarchy)
# ===========================================================
Write-Host ""
Write-Host "[3/5] Running Session 28 migration (level hierarchy)..." -ForegroundColor Yellow

php artisan migrate --path=database/migrations/2026_01_14_add_level_to_roles.php --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Hierarchy levels added successfully!" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Migration failed!" -ForegroundColor Red
    exit 1
}

# ===========================================================
# STEP 4: SEED ROLES WITH DEVELOPER
# ===========================================================
Write-Host ""
Write-Host "[4/5] Seeding roles (including Developer role)..." -ForegroundColor Yellow

php artisan db:seed --class=RolesSeeder --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Roles seeded with hierarchy!" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Roles seeding failed!" -ForegroundColor Red
    exit 1
}

# ===========================================================
# STEP 5: CREATE DEVELOPER ACCOUNT (daniel@quty.co.id)
# ===========================================================
Write-Host ""
Write-Host "[5/5] Creating Developer account (daniel@quty.co.id)..." -ForegroundColor Yellow

php artisan db:seed --class=DeveloperSeeder --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Developer account created successfully!" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Developer account creation failed!" -ForegroundColor Red
    exit 1
}

# ===========================================================
# DISPLAY MIGRATION STATUS
# ===========================================================
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " MIGRATION STATUS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

php artisan migrate:status | Select-String "display_name|level"

# ===========================================================
# COMPLETION SUMMARY
# ===========================================================
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host " DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "What was deployed:" -ForegroundColor White
Write-Host "  [OK] Session 27: display_name field for roles" -ForegroundColor Green
Write-Host "  [OK] Session 28: level hierarchy system" -ForegroundColor Green
Write-Host "  [OK] 7 Roles with hierarchy (0-6)" -ForegroundColor Green
Write-Host "  [OK] Developer account (daniel@quty.co.id)" -ForegroundColor Green
Write-Host ""
Write-Host "Role Hierarchy:" -ForegroundColor White
Write-Host "  Level 0: Developer (daniel@quty.co.id)" -ForegroundColor Cyan
Write-Host "  Level 1: Superadmin" -ForegroundColor Cyan
Write-Host "  Level 2: Director" -ForegroundColor Cyan
Write-Host "  Level 3: Manager" -ForegroundColor Cyan
Write-Host "  Level 4: HR" -ForegroundColor Cyan
Write-Host "  Level 5: Admin, Receptionist" -ForegroundColor Cyan
Write-Host "  Level 6: User" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Login to Admin Panel with daniel@quty.co.id" -ForegroundColor White
Write-Host "  2. Change default password: Dev@2026!Secure" -ForegroundColor White
Write-Host "  3. Test permissions in Admin Panel" -ForegroundColor White
Write-Host "  4. Verify role hierarchy display" -ForegroundColor White
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
