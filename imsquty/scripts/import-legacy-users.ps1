# Import Legacy Users from itquty.sql to IMSQuty Structure
# Mapping old structure to new structure

Write-Output "=== IMSQuty Legacy User Import ==="
Write-Output "Extracting users from itquty.sql and adapting to new structure..."
Write-Output ""

# Extract INSERT statements for users from itquty.sql
$sqlFile = "d:\Project\ITQuty\itquty.sql"
$userInserts = Select-String -Path $sqlFile -Pattern "INSERT INTO \`?users\`?" -Context 0, 5

if ($userInserts.Count -eq 0) {
    Write-Output "❌ No user data found in itquty.sql"
    exit 1
}

Write-Output "✅ Found user insert statements in itquty.sql"
Write-Output ""

# Create temporary SQL file with adapted structure
$tempSql = "d:\Project\ITQuty\imsquty\scripts\temp_users_import.sql"

# SQL to map old structure to new structure
$importSql = @"
-- Legacy Users Import for IMSQuty
-- Mapping from old 'name' column to new 'username' column
-- Source: itquty.sql (legacy database)

USE imsquty;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS=0;

-- Import users with structure mapping
-- Old structure: id, name, email, email_verified_at, password, remember_token, created_at, updated_at
-- New structure: id, username, email, email_verified_at, password, role_id, status, last_login_at, remember_token, created_at, updated_at

-- Note: We'll use 'name' as 'username' and set default values for new columns

INSERT INTO users (id, username, email, email_verified_at, password, role_id, status, remember_token, created_at, updated_at)
SELECT 
    u_old.id,
    u_old.name as username,  -- Map 'name' to 'username'
    u_old.email,
    u_old.email_verified_at,
    u_old.password,
    6 as role_id,  -- Default to 'user' role (ID 6)
    'active' as status,  -- Default status
    u_old.remember_token,
    u_old.created_at,
    u_old.updated_at
FROM (
    -- Original user data from itquty.sql will be inserted here
    -- This is a placeholder - we'll extract actual data
    SELECT 1 as id, 'placeholder' as name, 'placeholder@example.com' as email, 
           NULL as email_verified_at, 'password' as password, 
           NULL as remember_token, NOW() as created_at, NOW() as updated_at
) as u_old
WHERE FALSE;  -- This prevents actual execution of placeholder

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

"@

Write-Output "Creating import SQL with structure mapping..."
$importSql | Out-File -FilePath $tempSql -Encoding UTF8

Write-Output "✅ Import SQL created: $tempSql"
Write-Output ""
Write-Output "⚠️  Manual step required:"
Write-Output "1. Extract user INSERT statements from itquty.sql"
Write-Output "2. Modify the INSERT to map 'name' -> 'username'"
Write-Output "3. Add default values for new columns (role_id=6, status='active')"
Write-Output ""
Write-Output "Alternative: Let me create a direct import command..."

# Create direct import using MySQL INSERT...SELECT with JSON data
Write-Output ""
Write-Output "=== Attempting Direct Import ==="

# Import the entire itquty.sql first into a temporary database
Write-Output "Step 1: Creating temporary database for legacy data..."
$createTempDb = @"
CREATE DATABASE IF NOT EXISTS itquty_legacy;
"@

$createTempDb | docker exec -i imsquty-mysql mysql -uimsquty -pimsquty112233 2>&1 | Out-Null

Write-Output "Step 2: Importing itquty.sql into temporary database..."
Get-Content $sqlFile | docker exec -i imsquty-mysql mysql -uimsquty -pimsquty112233 itquty_legacy 2>&1 | Select-Object -Last 5

Write-Output ""
Write-Output "Step 3: Copying users with structure mapping..."

$mappingSql = @"
USE imsquty;

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS=0;

-- Clear existing users if needed (DANGEROUS - comment out if you want to keep existing users)
-- TRUNCATE TABLE users;

-- Copy users from legacy database with structure mapping
INSERT INTO users (id, username, email, email_verified_at, password, role_id, status, remember_token, created_at, updated_at)
SELECT 
    id,
    name as username,  -- Map 'name' column to 'username'
    email,
    email_verified_at,
    password,
    6 as role_id,  -- Default to 'user' role
    'active' as status,
    remember_token,
    created_at,
    updated_at
FROM itquty_legacy.users
ON DUPLICATE KEY UPDATE
    username = VALUES(username),
    email = VALUES(email),
    password = VALUES(password),
    updated_at = VALUES(updated_at);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Show results
SELECT COUNT(*) as total_users_imported FROM users;
SELECT username, email, status, role_id, created_at FROM users LIMIT 10;
"@

Write-Output "Executing user migration with structure mapping..."
$mappingSql | docker exec -i imsquty-mysql mysql -uimsquty -pimsquty112233 2>&1

Write-Output ""
Write-Output "=== Import Complete ==="
Write-Output "Cleaning up temporary database..."
"DROP DATABASE IF EXISTS itquty_legacy;" | docker exec -i imsquty-mysql mysql -uimsquty -pimsquty112233 2>&1 | Out-Null

Write-Output "✅ Legacy user import completed!"
Write-Output ""
Write-Output "Next steps:"
Write-Output "1. Verify imported users: docker exec imsquty-mysql mysql -uimsquty -pimsquty112233 imsquty -e 'SELECT COUNT(*) FROM users;'"
Write-Output "2. Assign proper roles to users (currently all set to role_id=6 'user')"
Write-Output "3. Update user statuses if needed"
