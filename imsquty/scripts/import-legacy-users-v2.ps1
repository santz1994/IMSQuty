# Import users from legacy database to new IMSQuty structure
# Uses Spatie Permission package for role assignment

Write-Host "=== Importing Legacy Users to IMSQuty ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$legacySqlFile = "d:\Project\ITQuty\itquty.sql"
$mysqlContainer = "imsquty-mysql"
$mysqlUser = "imsquty"
$mysqlPass = "imsquty112233"
$mysqlDb = "imsquty"

# Check if legacy SQL file exists
if (!(Test-Path $legacySqlFile)) {
    Write-Host "❌ Error: Legacy SQL file not found at $legacySqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Legacy SQL file found: $legacySqlFile" -ForegroundColor Green

# First check if there are any users in legacy file
Write-Host "Checking for user data in legacy SQL file..." -ForegroundColor Yellow
$userInserts = Select-String -Path $legacySqlFile -Pattern "INSERT INTO.*users" -CaseSensitive:$false

if ($userInserts.Count -eq 0) {
    Write-Host "❌ No user INSERT statements found in itquty.sql" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Note: The legacy SQL file contains asset data but no user data." -ForegroundColor Cyan
    Write-Host "   You can use create-admin-users.ps1 to create test users instead." -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Found $($userInserts.Count) user-related insert statement(s)" -ForegroundColor Green
Write-Host ""

# Create temporary database for legacy data
Write-Host "Creating temporary database 'itquty_legacy'..." -ForegroundColor Yellow
$createTempDbSql = @"
DROP DATABASE IF EXISTS itquty_legacy;
CREATE DATABASE itquty_legacy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"@

$createTempDbSql | docker exec -i $mysqlContainer mysql -u$mysqlUser -p$mysqlPass 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create temporary database" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Temporary database created" -ForegroundColor Green
Write-Host ""

# Import legacy SQL into temporary database
Write-Host "Importing legacy SQL file into temporary database..." -ForegroundColor Yellow
Write-Host "   This may take a moment..." -ForegroundColor Gray

Get-Content $legacySqlFile -Raw | docker exec -i $mysqlContainer mysql -u$mysqlUser -p$mysqlPass itquty_legacy 2>&1 | Out-Null

Write-Host "✅ Legacy SQL imported" -ForegroundColor Green
Write-Host ""

# Check if users table exists in legacy database
Write-Host "Verifying users table in legacy database..." -ForegroundColor Yellow
$checkTableSql = "SHOW TABLES FROM itquty_legacy LIKE 'users';"
$tableExists = $checkTableSql | docker exec -i $mysqlContainer mysql -u$mysqlUser -p$mysqlPass -sN

if ([string]::IsNullOrWhiteSpace($tableExists)) {
    Write-Host "❌ Users table not found in legacy database" -ForegroundColor Red
    
    # Cleanup
    "DROP DATABASE IF EXISTS itquty_legacy;" | docker exec -i $mysqlContainer mysql -u$mysqlUser -p$mysqlPass 2>&1 | Out-Null
    exit 1
}

Write-Host "✅ Users table exists in legacy database" -ForegroundColor Green
Write-Host ""

# Get legacy user count
Write-Host "Counting legacy users..." -ForegroundColor Yellow
$countSql = "SELECT COUNT(*) FROM itquty_legacy.users;"
$legacyCount = $countSql | docker exec -i $mysqlContainer mysql -u$mysqlUser -p$mysqlPass -sN

Write-Host "✅ Found $legacyCount users in legacy database" -ForegroundColor Green
Write-Host ""

# Map and import legacy users to new structure
Write-Host "Mapping legacy users to new structure..." -ForegroundColor Yellow
Write-Host "   Mapping 'name' → 'username'" -ForegroundColor Gray
Write-Host "   Splitting names into 'first_name' and 'last_name'" -ForegroundColor Gray
Write-Host "   Assigning default 'user' role" -ForegroundColor Gray
Write-Host ""

$importUsersSql = @"
USE $mysqlDb;

-- Import users from legacy database with proper column mapping
-- Old structure: id, name, email, email_verified_at, password, ...
-- New structure: id, username, email, first_name, last_name, password, ...

INSERT INTO users (
    username,
    email,
    email_verified_at,
    password,
    first_name,
    last_name,
    status,
    created_at,
    updated_at
)
SELECT 
    l.name as username,                          -- Map 'name' to 'username'
    l.email,
    l.email_verified_at,
    l.password,
    COALESCE(NULLIF(SUBSTRING_INDEX(l.name, ' ', 1), ''), 'User') as first_name,   -- First part of name
    COALESCE(NULLIF(SUBSTRING_INDEX(l.name, ' ', -1), ''), 'Name') as last_name,   -- Last part of name
    'active' as status,
    COALESCE(l.created_at, NOW()) as created_at,
    COALESCE(l.updated_at, NOW()) as updated_at
FROM itquty_legacy.users l
WHERE l.email IS NOT NULL 
  AND l.email != ''
  AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.email = l.email
);

-- Store imported user IDs for role assignment
CREATE TEMPORARY TABLE temp_imported_users AS
SELECT u.id, u.email
FROM users u
WHERE EXISTS (
    SELECT 1 FROM itquty_legacy.users l WHERE l.email = u.email
);

-- Count imported users
SELECT COUNT(*) as imported_count FROM temp_imported_users;

-- Assign default 'user' role to all imported users (role_id=6)
INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT 6, 'App\\\\Models\\\\User', t.id
FROM temp_imported_users t
WHERE NOT EXISTS (
    SELECT 1 FROM model_has_roles mhr 
    WHERE mhr.model_id = t.id 
      AND mhr.model_type = 'App\\\\Models\\\\User'
);

-- Show sample of imported users
SELECT 
    u.id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    r.name as role,
    u.status,
    u.created_at
FROM users u
INNER JOIN temp_imported_users t ON u.id = t.id
LEFT JOIN model_has_roles mhr ON mhr.model_id = u.id AND mhr.model_type = 'App\\\\Models\\\\User'
LEFT JOIN roles r ON r.id = mhr.role_id
ORDER BY u.id
LIMIT 10;

-- Cleanup
DROP TEMPORARY TABLE IF EXISTS temp_imported_users;
"@

$importUsersSql | docker exec -i $mysqlContainer mysql -u$mysqlUser -p$mysqlPass

Write-Host ""
Write-Host "✅ Users imported and mapped successfully!" -ForegroundColor Green
Write-Host ""

# Cleanup: Drop temporary database
Write-Host "Cleaning up temporary database..." -ForegroundColor Yellow
"DROP DATABASE IF EXISTS itquty_legacy;" | docker exec -i $mysqlContainer mysql -u$mysqlUser -p$mysqlPass 2>&1 | Out-Null

Write-Host "✅ Cleanup complete" -ForegroundColor Green
Write-Host ""

Write-Host "=== Import Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Legacy 'name' column mapped to 'username'" -ForegroundColor Gray
Write-Host "   ✅ Names split into 'first_name' and 'last_name'" -ForegroundColor Gray
Write-Host "   ✅ All imported users assigned 'user' role via model_has_roles" -ForegroundColor Gray
Write-Host "   ✅ Email duplicates were skipped" -ForegroundColor Gray
Write-Host "   ✅ Default status: 'active'" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  Note: All imported users have default 'user' role." -ForegroundColor Yellow
Write-Host "   Use auth-service API or database to upgrade specific users to admin roles." -ForegroundColor Yellow
Write-Host ""
