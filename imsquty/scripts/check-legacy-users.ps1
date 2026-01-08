# Simple Legacy User Import - Direct Approach
# Checks itquty.sql for user data and reports findings

Write-Host "=== Legacy User Data Analysis ===" -ForegroundColor Cyan
Write-Host ""

$legacySqlFile = "d:\Project\ITQuty\itquty.sql"

if (!(Test-Path $legacySqlFile)) {
    Write-Host "[ERROR] Legacy SQL file not found at $legacySqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Legacy SQL file found" -ForegroundColor Green
Write-Host "     Location: $legacySqlFile" -ForegroundColor Gray
Write-Host "     Size: $([math]::Round((Get-Item $legacySqlFile).Length / 1MB, 2)) MB" -ForegroundColor Gray
Write-Host ""

# Search for user-related INSERT statements
Write-Host "Searching for user data..." -ForegroundColor Yellow
$userInserts = Select-String -Path $legacySqlFile -Pattern "INSERT INTO.*\`?users\`?" -CaseSensitive:$false

if ($userInserts.Count -eq 0) {
    Write-Host "[RESULT] No user INSERT statements found in itquty.sql" -ForegroundColor Red
    Write-Host ""
    Write-Host "Analysis:" -ForegroundColor Cyan
    Write-Host "- The legacy SQL file does NOT contain user data" -ForegroundColor Gray
    Write-Host "- File contains: asset data, divisions, locations, manufacturers, etc." -ForegroundColor Gray
    Write-Host "- No user records to import from legacy system" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Recommendation:" -ForegroundColor Yellow
    Write-Host "- Use create-admin-users.ps1 to create test/admin users" -ForegroundColor Gray
    Write-Host "- Users already created: superadmin, director, manager, admin, hr, user" -ForegroundColor Gray
    Write-Host "- All users can login with password: 'password'" -ForegroundColor Gray
    Write-Host ""
    
    # Show what tables ARE in the SQL file
    Write-Host "Tables found in itquty.sql:" -ForegroundColor Cyan
    $allInserts = Select-String -Path $legacySqlFile -Pattern "INSERT INTO \`?(\w+)\`?" -AllMatches
    $tables = $allInserts | ForEach-Object { $_.Matches[0].Groups[1].Value } | Select-Object -Unique | Sort-Object
    
    foreach ($table in $tables) {
        Write-Host "  - $table" -ForegroundColor Gray
    }
    Write-Host ""
    
    exit 0
}

Write-Host "[FOUND] User data exists in legacy SQL!" -ForegroundColor Green
Write-Host "        Found $($userInserts.Count) INSERT statement(s)" -ForegroundColor Gray
Write-Host ""

# Extract sample of user data
Write-Host "Sample user data from legacy SQL:" -ForegroundColor Cyan
$userInserts | Select-Object -First 5 | ForEach-Object {
    Write-Host $_.Line.Substring(0, [Math]::Min(100, $_.Line.Length)) -ForegroundColor Gray
    Write-Host "..." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Legacy user data exists and can be imported" -ForegroundColor Gray
Write-Host "2. Need to map old 'name' column to new 'username' column" -ForegroundColor Gray
Write-Host "3. Need to split names into 'first_name' and 'last_name'" -ForegroundColor Gray
Write-Host "4. Need to assign roles via model_has_roles table" -ForegroundColor Gray
Write-Host ""
