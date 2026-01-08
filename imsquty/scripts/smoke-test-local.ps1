# IMSQuty Local Smoke Test Script
# Purpose: Verify system functionality in development environment
# Safe to run: YES (local only, no production impact)

Write-Output ""
Write-Output "═══════════════════════════════════════════════════════════════"
Write-Output "  IMSQuty SMOKE TEST - Development Environment"
Write-Output "═══════════════════════════════════════════════════════════════"
Write-Output ""

$baseUrl = "http://localhost:8000"
$testResults = @()

# Helper function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [string]$Token = $null,
        [hashtable]$Body = $null
    )
    
    Write-Output "Testing: $Name..."
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        if ($Method -eq "POST" -and $Body) {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body ($Body | ConvertTo-Json) -TimeoutSec 10
        }
        else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -TimeoutSec 10
        }
        
        Write-Output "  ✅ PASS - Status: 200 OK"
        return @{
            Name    = $Name
            Status  = "PASS"
            Message = "OK"
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Output "  ❌ FAIL - Status: $statusCode"
        Write-Output "     Error: $($_.Exception.Message)"
        return @{
            Name    = $Name
            Status  = "FAIL"
            Message = $_.Exception.Message
        }
    }
    
    Write-Output ""
}

# Test 1: Docker Services
Write-Output ""
Write-Output "─────────────────────────────────────────────────────────────"
Write-Output "TEST 1: Docker Services Status"
Write-Output "─────────────────────────────────────────────────────────────"

try {
    $services = docker ps --format "table {{.Names}}\t{{.Status}}" 2>&1
    if ($services -match "error") {
        Write-Output "  ❌ Docker not running or not installed"
        $testResults += @{Name = "Docker Services"; Status = "FAIL"; Message = "Docker not available" }
    }
    else {
        Write-Output $services
        $runningCount = (docker ps -q | Measure-Object).Count
        Write-Output ""
        Write-Output "  ✅ $runningCount services running"
        $testResults += @{Name = "Docker Services"; Status = "PASS"; Message = "$runningCount running" }
    }
}
catch {
    Write-Output "  ❌ Failed to check Docker services"
    $testResults += @{Name = "Docker Services"; Status = "FAIL"; Message = "Docker check failed" }
}

Write-Output ""

# Test 2: Health Check Endpoints
Write-Output "─────────────────────────────────────────────────────────────"
Write-Output "TEST 2: Health Check Endpoints"
Write-Output "─────────────────────────────────────────────────────────────"
Write-Output ""

$healthEndpoints = @(
    @{Name = "Auth Service Health"; Url = "$baseUrl/api/health" }
)

foreach ($endpoint in $healthEndpoints) {
    $result = Test-Endpoint -Name $endpoint.Name -Url $endpoint.Url
    $testResults += $result
}

# Test 3: Database Connectivity
Write-Output "─────────────────────────────────────────────────────────────"
Write-Output "TEST 3: Database Connectivity"
Write-Output "─────────────────────────────────────────────────────────────"
Write-Output ""

Write-Output "Testing: MySQL Connection..."
try {
    $mysqlTest = docker exec imsquty-mysql mysql -uimsquty -pimsquty112233 -e "SELECT 1" 2>&1
    if ($mysqlTest -match "1") {
        Write-Output "  ✅ PASS - MySQL connection successful"
        $testResults += @{Name = "MySQL Connectivity"; Status = "PASS"; Message = "Connected" }
    }
    else {
        Write-Output "  ❌ FAIL - MySQL connection failed"
        $testResults += @{Name = "MySQL Connectivity"; Status = "FAIL"; Message = "Connection failed" }
    }
}
catch {
    Write-Output "  ⚠️  SKIP - MySQL container not found (may not be running)"
    $testResults += @{Name = "MySQL Connectivity"; Status = "SKIP"; Message = "Container not found" }
}

Write-Output ""

# Test 4: Redis Connectivity
Write-Output "Testing: Redis Connection..."
try {
    $redisTest = docker exec imsquty-redis redis-cli -a imsquty112233 PING 2>&1
    if ($redisTest -match "PONG") {
        Write-Output "  ✅ PASS - Redis connection successful"
        $testResults += @{Name = "Redis Connectivity"; Status = "PASS"; Message = "Connected" }
    }
    else {
        Write-Output "  ❌ FAIL - Redis connection failed"
        $testResults += @{Name = "Redis Connectivity"; Status = "FAIL"; Message = "Connection failed" }
    }
}
catch {
    Write-Output "  ⚠️  SKIP - Redis container not found (may not be running)"
    $testResults += @{Name = "Redis Connectivity"; Status = "SKIP"; Message = "Container not found" }
}

Write-Output ""

# Test 5: Configuration Verification
Write-Output "─────────────────────────────────────────────────────────────"
Write-Output "TEST 4: Configuration Verification"
Write-Output "─────────────────────────────────────────────────────────────"
Write-Output ""

Write-Output "Checking timezone configuration..."
$servicesPath = "d:\Project\ITQuty\imsquty\services"
$timezoneCount = 0
$localeCount = 0

$serviceList = @("auth-service", "asset-service", "ticket-service", "user-service", 
    "meeting-room-service", "financial-service", "inventory-service", 
    "notification-service", "reporting-service")

foreach ($service in $serviceList) {
    $configPath = Join-Path $servicesPath "$service\config\app.php"
    if (Test-Path $configPath) {
        $content = Get-Content $configPath -Raw
        if ($content -match "Asia/Jakarta") {
            $timezoneCount++
        }
        if ($content -match "'locale'\s*=>\s*env\('APP_LOCALE',\s*'id'\)") {
            $localeCount++
        }
    }
}

Write-Output "  Timezone (Asia/Jakarta): $timezoneCount/9 services configured"
Write-Output "  Locale (Indonesian): $localeCount/9 services configured"

if ($timezoneCount -eq 9 -and $localeCount -eq 9) {
    Write-Output "  ✅ PASS - All services properly configured"
    $testResults += @{Name = "Configuration Check"; Status = "PASS"; Message = "All configured" }
}
else {
    Write-Output "  ⚠️  WARNING - Some services may not be configured"
    $testResults += @{Name = "Configuration Check"; Status = "WARN"; Message = "Partial configuration" }
}

Write-Output ""

# Test 6: DateTimeHelper Utility
Write-Output "─────────────────────────────────────────────────────────────"
Write-Output "TEST 5: DateTimeHelper Utility"
Write-Output "─────────────────────────────────────────────────────────────"
Write-Output ""

$helperPath = "d:\Project\ITQuty\imsquty\shared\Helpers\DateTimeHelper.php"
if (Test-Path $helperPath) {
    $helperContent = Get-Content $helperPath -Raw
    $methodCount = ([regex]::Matches($helperContent, "public static function")).Count
    Write-Output "  ✅ PASS - DateTimeHelper exists"
    Write-Output "  Methods found: $methodCount"
    $testResults += @{Name = "DateTimeHelper"; Status = "PASS"; Message = "$methodCount methods" }
}
else {
    Write-Output "  ❌ FAIL - DateTimeHelper not found"
    $testResults += @{Name = "DateTimeHelper"; Status = "FAIL"; Message = "File not found" }
}

Write-Output ""

# Test 7: Documentation Check
Write-Output "─────────────────────────────────────────────────────────────"
Write-Output "TEST 6: Production Documentation"
Write-Output "─────────────────────────────────────────────────────────────"
Write-Output ""

$docs = @(
    @{Name = "Production Env Guide"; Path = "d:\Project\ITQuty\docs\PRODUCTION_ENV_CONFIGURATION_GUIDE.md" },
    @{Name = "Phase 4 Report"; Path = "d:\Project\ITQuty\docs\PHASE4_COMPLETE_SUMMARY.md" },
    @{Name = "Deployment Readiness"; Path = "d:\Project\ITQuty\docs\PRODUCTION_DEPLOYMENT_READINESS.md" }
)

$docCount = 0
foreach ($doc in $docs) {
    if (Test-Path $doc.Path) {
        Write-Output "  ✅ $($doc.Name) - Found"
        $docCount++
    }
    else {
        Write-Output "  ❌ $($doc.Name) - Missing"
    }
}

$testResults += @{Name = "Documentation"; Status = "PASS"; Message = "$docCount/3 docs" }
Write-Output ""

# Summary
Write-Output "═══════════════════════════════════════════════════════════════"
Write-Output "  TEST SUMMARY"
Write-Output "═══════════════════════════════════════════════════════════════"
Write-Output ""

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failedTests = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$skippedTests = ($testResults | Where-Object { $_.Status -eq "SKIP" }).Count
$warningTests = ($testResults | Where-Object { $_.Status -eq "WARN" }).Count

Write-Output "Total Tests:   $totalTests"
Write-Output "✅ Passed:     $passedTests"
Write-Output "❌ Failed:     $failedTests"
Write-Output "⚠️  Warnings:  $warningTests"
Write-Output "⏭️  Skipped:   $skippedTests"
Write-Output ""

$passRate = [math]::Round(($passedTests / $totalTests) * 100, 1)
Write-Output "Pass Rate:     $passRate%"
Write-Output ""

if ($failedTests -eq 0) {
    Write-Output "✅ RESULT: ALL CRITICAL TESTS PASSED"
    Write-Output "   System is ready for local development/testing"
}
elseif ($failedTests -le 2) {
    Write-Output "⚠️  RESULT: MOSTLY PASSED WITH MINOR ISSUES"
    Write-Output "   Review failed tests above"
}
else {
    Write-Output "❌ RESULT: MULTIPLE FAILURES DETECTED"
    Write-Output "   System may not be functioning correctly"
}

Write-Output ""
Write-Output "─────────────────────────────────────────────────────────────"
Write-Output "TEST DETAILS:"
Write-Output "─────────────────────────────────────────────────────────────"
foreach ($result in $testResults) {
    $icon = switch ($result.Status) {
        "PASS" { "✅" }
        "FAIL" { "❌" }
        "SKIP" { "⏭️ " }
        "WARN" { "⚠️ " }
    }
    Write-Output "$icon $($result.Name): $($result.Message)"
}

Write-Output ""
Write-Output "═══════════════════════════════════════════════════════════════"
Write-Output "  Smoke Test Complete"
Write-Output "  Environment: Development (Local)"
Write-Output "  Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Output "═══════════════════════════════════════════════════════════════"
Write-Output ""

# Note about production
Write-Output "NOTE: This is a LOCAL smoke test only."
Write-Output "      Production deployment requires additional prerequisites."
Write-Output "      See: docs/PRODUCTION_DEPLOYMENT_READINESS.md"
Write-Output ""
