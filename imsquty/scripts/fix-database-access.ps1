# ==========================================
# Fix Database Access Issues
# Daniel Rizaldy - Senior IT Developer Programmer
# ==========================================

Write-Host "=" -ForegroundColor Cyan -NoNewline; Write-Host "="*60 -ForegroundColor Cyan
Write-Host " FIX DATABASE ACCESS ISSUES" -ForegroundColor Yellow
Write-Host "=" -ForegroundColor Cyan -NoNewline; Write-Host "="*60 -ForegroundColor Cyan
Write-Host ""

# Step 1: Find MySQL root password
Write-Host "[1/5] Checking MySQL connection..." -ForegroundColor Cyan

$possiblePasswords = @(
    "imsquty112233",
    "",  # No password
    "root",
    "password",
    "admin"
)

$workingPassword = $null
$mysqlFound = $false

foreach ($password in $possiblePasswords) {
    Write-Host "  Testing root password: " -NoNewline
    if ($password -eq "") {
        Write-Host "<empty>" -ForegroundColor Gray
        $result = mysql -u root -e "SELECT 1" 2>&1
    }
    else {
        Write-Host "$password" -ForegroundColor Gray
        $result = mysql -u root -p"$password" -e "SELECT 1" 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        $workingPassword = $password
        $mysqlFound = $true
        Write-Host "  ✅ MySQL connection successful!" -ForegroundColor Green
        break
    }
}

if (-not $mysqlFound) {
    Write-Host "  ❌ Could not connect to MySQL with any known password" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTION OPTIONS:" -ForegroundColor Yellow
    Write-Host "  1. Check your MySQL installation and root password" -ForegroundColor White
    Write-Host "  2. Use Docker instead: docker-compose up -d mysql" -ForegroundColor White
    Write-Host "  3. Manually create user with: " -ForegroundColor White
    Write-Host "     CREATE USER 'imsquty'@'localhost' IDENTIFIED BY 'imsquty112233';" -ForegroundColor Gray
    Write-Host "     GRANT ALL PRIVILEGES ON *.* TO 'imsquty'@'localhost';" -ForegroundColor Gray
    Write-Host "     FLUSH PRIVILEGES;" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Step 2: Check if imsquty user exists
Write-Host "[2/5] Checking imsquty user..." -ForegroundColor Cyan

if ($workingPassword -eq "") {
    $userCheck = mysql -u root -e "SELECT User, Host FROM mysql.user WHERE User='imsquty'" 2>&1
}
else {
    $userCheck = mysql -u root -p"$workingPassword" -e "SELECT User, Host FROM mysql.user WHERE User='imsquty'" 2>&1
}

if ($userCheck -match "imsquty") {
    Write-Host "  ✅ User 'imsquty' already exists" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  User 'imsquty' does not exist. Creating..." -ForegroundColor Yellow
    
    # Step 3: Create imsquty user
    Write-Host "[3/5] Creating imsquty user..." -ForegroundColor Cyan
    
    $createUserSQL = @"
CREATE USER IF NOT EXISTS 'imsquty'@'localhost' IDENTIFIED BY 'imsquty112233';
GRANT ALL PRIVILEGES ON *.* TO 'imsquty'@'localhost' WITH GRANT OPTION;
CREATE USER IF NOT EXISTS 'imsquty'@'%' IDENTIFIED BY 'imsquty112233';
GRANT ALL PRIVILEGES ON *.* TO 'imsquty'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
"@
    
    if ($workingPassword -eq "") {
        $result = mysql -u root -e $createUserSQL 2>&1
    }
    else {
        $result = mysql -u root -p"$workingPassword" -e $createUserSQL 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ User 'imsquty' created successfully" -ForegroundColor Green
    }
    else {
        Write-Host "  ❌ Failed to create user" -ForegroundColor Red
        Write-Host $result
        exit 1
    }
}

Write-Host ""

# Step 4: Create database if not exists
Write-Host "[4/5] Checking database..." -ForegroundColor Cyan

if ($workingPassword -eq "") {
    $result = mysql -u root -e "CREATE DATABASE IF NOT EXISTS imsquty CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1
}
else {
    $result = mysql -u root -p"$workingPassword" -e "CREATE DATABASE IF NOT EXISTS imsquty CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Database 'imsquty' ready" -ForegroundColor Green
}
else {
    Write-Host "  ❌ Failed to create database" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 5: Test connection with imsquty user
Write-Host "[5/5] Testing imsquty user connection..." -ForegroundColor Cyan

$testResult = mysql -u imsquty -pimsquty112233 -e "USE imsquty; SELECT 1 AS test;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Connection successful!" -ForegroundColor Green
}
else {
    Write-Host "  ❌ Connection failed" -ForegroundColor Red
    Write-Host $testResult
    exit 1
}

Write-Host ""
Write-Host "=" -ForegroundColor Green -NoNewline; Write-Host "="*60 -ForegroundColor Green
Write-Host " DATABASE ACCESS FIXED!" -ForegroundColor Green
Write-Host "=" -ForegroundColor Green -NoNewline; Write-Host "="*60 -ForegroundColor Green
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Update all service .env files if needed" -ForegroundColor White
Write-Host "  2. Run migrations: php artisan migrate" -ForegroundColor White
Write-Host "  3. Start your services" -ForegroundColor White
Write-Host ""

# Optional: Update .env files
Write-Host "Would you like to update all service .env files to use localhost? (Y/N): " -NoNewline -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "Updating .env files..." -ForegroundColor Cyan
    
    $services = @(
        "services/auth-service",
        "services/user-service",
        "services/meeting-room-service",
        "services/ticket-service",
        "services/master-data-service",
        "services/notification-service",
        "services/reporting-service",
        "services/asset-service",
        "services/inventory-service",
        "services/financial-service"
    )
    
    foreach ($service in $services) {
        $envPath = Join-Path $PSScriptRoot "..\$service\.env"
        if (Test-Path $envPath) {
            Write-Host "  Updating $service..." -ForegroundColor Gray
            (Get-Content $envPath) -replace 'DB_HOST=mysql', 'DB_HOST=localhost' |
            Set-Content $envPath
        }
    }
    
    Write-Host "  ✅ All .env files updated to use localhost" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done! Database access issue fixed." -ForegroundColor Green
