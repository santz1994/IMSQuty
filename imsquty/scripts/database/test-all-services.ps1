# Test All Services - Run PHPUnit tests
# Date: December 19, 2025

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Testing All Microservices" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

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

$testResults = @()

foreach ($service in $services) {
    $servicePath = "services\$service"
    
    if (Test-Path $servicePath) {
        Write-Host "Testing $service..." -ForegroundColor Cyan
        
        Push-Location $servicePath
        
        # Run tests
        $output = php artisan test 2>&1 | Out-String
        $success = $LASTEXITCODE -eq 0
        
        Pop-Location
        
        # Parse test results
        if ($output -match "Tests:\s+(\d+) passed") {
            $passed = $matches[1]
        } else {
            $passed = 0
        }
        
        if ($output -match "Tests:\s+\d+ passed.*?(\d+) failed") {
            $failed = $matches[1]
        } else {
            $failed = 0
        }
        
        $total = [int]$passed + [int]$failed
        
        if ($success -and $total -gt 0) {
            Write-Host "  ✅ $passed/$total tests passed" -ForegroundColor Green
            $status = "✅ Pass"
        } elseif ($total -gt 0) {
            Write-Host "  ⚠️ $passed/$total tests passed" -ForegroundColor Yellow
            $status = "⚠️ Partial"
        } else {
            Write-Host "  ❌ No tests or all failed" -ForegroundColor Red
            $status = "❌ Failed"
        }
        
        $testResults += [PSCustomObject]@{
            Service = $service
            Status = $status
            Passed = $passed
            Failed = $failed
            Total = $total
        }
        
        Write-Host ""
    }
}

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$testResults | Format-Table -AutoSize

$totalPassed = ($testResults | Measure-Object -Property Passed -Sum).Sum
$totalTests = ($testResults | Measure-Object -Property Total -Sum).Sum
$passRate = if ($totalTests -gt 0) { [math]::Round(($totalPassed / $totalTests) * 100, 1) } else { 0 }

Write-Host ""
Write-Host "Overall: $totalPassed/$totalTests tests passed ($passRate%)" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 50) { "Yellow" } else { "Red" })
Write-Host ""
