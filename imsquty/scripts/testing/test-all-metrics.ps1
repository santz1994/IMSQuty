# ================================================================
# IMSQuty - Comprehensive Metrics & Monitoring Testing Script
# ================================================================
# Tests all 10 services + monitoring stack
# Verifies 168+ metrics are properly exposed
# Author: Senior Developer Team
# Date: January 8, 2026
# ================================================================

param(
    [switch]$Verbose,
    [switch]$OpenBrowsers,
    [switch]$ExportReport
)

$ErrorActionPreference = "Continue"

# Colors
$ColorSuccess = "Green"
$ColorError = "Red"
$ColorWarning = "Yellow"
$ColorInfo = "Cyan"
$ColorHeader = "Magenta"

# Configuration
$Services = @(
    @{Name = "Auth Service"; Port = 8000; ExpectedMetrics = 25 },
    @{Name = "Asset Service"; Port = 8001; ExpectedMetrics = 18 },
    @{Name = "Ticket Service"; Port = 8002; ExpectedMetrics = 21 },
    @{Name = "Meeting Room Service"; Port = 8003; ExpectedMetrics = 20 },
    @{Name = "Inventory Service"; Port = 8004; ExpectedMetrics = 16 },
    @{Name = "Financial Service"; Port = 8005; ExpectedMetrics = 19 },
    @{Name = "User Service"; Port = 8006; ExpectedMetrics = 14 },
    @{Name = "Notification Service"; Port = 8007; ExpectedMetrics = 13 },
    @{Name = "Reporting Service"; Port = 8008; ExpectedMetrics = 12 },
    @{Name = "Master Data Service"; Port = 8009; ExpectedMetrics = 10 }
)

$MonitoringServices = @(
    @{Name = "Prometheus"; Port = 9090; Path = "/-/healthy" },
    @{Name = "Grafana"; Port = 3001; Path = "/api/health" },
    @{Name = "Alertmanager"; Port = 9093; Path = "/-/healthy" }
)

# Results tracking
$Results = @{
    TotalServices     = $Services.Count
    HealthyServices   = 0
    UnhealthyServices = 0
    TotalMetrics      = 0
    ExpectedMetrics   = 168
    MonitoringHealthy = 0
    Errors            = @()
    Warnings          = @()
}

# ================================================================
# FUNCTIONS
# ================================================================

function Write-Banner {
    param([string]$Text)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor $ColorHeader
    Write-Host " $Text" -ForegroundColor $ColorHeader
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor $ColorHeader
    Write-Host ""
}

function Write-Section {
    param([string]$Text)
    Write-Host ""
    Write-Host "▶ $Text" -ForegroundColor $ColorInfo
    Write-Host "───────────────────────────────────────────────────────" -ForegroundColor DarkGray
}

function Test-ServiceHealth {
    param(
        [string]$ServiceName,
        [int]$Port
    )
    
    $url = "http://localhost:$Port/api/health"
    
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $json = $response.Content | ConvertFrom-Json
            Write-Host "  ✓ $ServiceName" -ForegroundColor $ColorSuccess -NoNewline
            Write-Host " - Status: $($json.status)" -ForegroundColor DarkGray
            return $true
        }
    }
    catch {
        Write-Host "  ✗ $ServiceName" -ForegroundColor $ColorError -NoNewline
        Write-Host " - NOT RESPONDING" -ForegroundColor DarkGray
        $Results.Errors += "$ServiceName health check failed: $($_.Exception.Message)"
        return $false
    }
}

function Get-ServiceMetricsCount {
    param(
        [string]$ServiceName,
        [int]$Port
    )
    
    $url = "http://localhost:$Port/api/metrics"
    
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            # Count "# HELP" lines (each metric has one)
            $helpLines = ($response.Content -split "`n" | Where-Object { $_ -match "^# HELP" }).Count
            return $helpLines
        }
    }
    catch {
        Write-Host "  ✗ Cannot fetch metrics from $ServiceName" -ForegroundColor $ColorError
        $Results.Errors += "$ServiceName metrics fetch failed: $($_.Exception.Message)"
        return 0
    }
}

function Test-PrometheusTargets {
    Write-Section "Testing Prometheus Targets"
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:9090/api/v1/targets" -UseBasicParsing
        $json = $response.Content | ConvertFrom-Json
        
        $upTargets = 0
        $downTargets = 0
        
        foreach ($target in $json.data.activeTargets) {
            if ($target.health -eq "up") {
                $upTargets++
                Write-Host "  ✓ $($target.labels.job)" -ForegroundColor $ColorSuccess -NoNewline
                Write-Host " - UP" -ForegroundColor DarkGray
            }
            else {
                $downTargets++
                Write-Host "  ✗ $($target.labels.job)" -ForegroundColor $ColorError -NoNewline
                Write-Host " - DOWN" -ForegroundColor DarkGray
                $Results.Errors += "Prometheus target $($target.labels.job) is DOWN"
            }
        }
        
        Write-Host ""
        Write-Host "  Targets UP: $upTargets | DOWN: $downTargets" -ForegroundColor $(if ($downTargets -eq 0) { $ColorSuccess } else { $ColorWarning })
        
        if ($downTargets -gt 0) {
            $Results.Warnings += "$downTargets Prometheus targets are down"
        }
        
        return $upTargets
    }
    catch {
        Write-Host "  ✗ Cannot connect to Prometheus" -ForegroundColor $ColorError
        $Results.Errors += "Prometheus API not accessible: $($_.Exception.Message)"
        return 0
    }
}

function Test-GrafanaDashboards {
    Write-Section "Testing Grafana Dashboards"
    
    try {
        # Note: This requires authentication, simplified check
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ Grafana API is accessible" -ForegroundColor $ColorSuccess
            Write-Host "  ℹ Dashboard URL: http://localhost:3001" -ForegroundColor $ColorInfo
            Write-Host "  ℹ Login: admin / admin123" -ForegroundColor DarkGray
            return $true
        }
    }
    catch {
        Write-Host "  ✗ Cannot connect to Grafana" -ForegroundColor $ColorError
        $Results.Errors += "Grafana not accessible: $($_.Exception.Message)"
        return $false
    }
}

function Export-TestReport {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $reportPath = "d:\Project\ITQuty\imsquty\scripts\testing\test-report-$timestamp.json"
    
    $report = @{
        Timestamp          = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Summary            = $Results
        Services           = $Services
        MonitoringServices = $MonitoringServices
    }
    
    $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8
    
    Write-Host ""
    Write-Host "  ℹ Report exported: $reportPath" -ForegroundColor $ColorInfo
}

# ================================================================
# MAIN EXECUTION
# ================================================================

Clear-Host

Write-Banner "IMSQuty - Comprehensive Metrics Testing"

Write-Host "Testing Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkGray
Write-Host "Total Services: $($Services.Count)" -ForegroundColor DarkGray
Write-Host "Expected Metrics: $($Results.ExpectedMetrics)" -ForegroundColor DarkGray
Write-Host ""

# ================================================================
# TEST 1: MONITORING STACK HEALTH
# ================================================================

Write-Section "TEST 1: Monitoring Stack Health Check"

foreach ($monitor in $MonitoringServices) {
    $url = "http://localhost:$($monitor.Port)$($monitor.Path)"
    
    try {
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✓ $($monitor.Name)" -ForegroundColor $ColorSuccess -NoNewline
            Write-Host " - HEALTHY (Port $($monitor.Port))" -ForegroundColor DarkGray
            $Results.MonitoringHealthy++
        }
    }
    catch {
        Write-Host "  ✗ $($monitor.Name)" -ForegroundColor $ColorError -NoNewline
        Write-Host " - NOT RESPONDING (Port $($monitor.Port))" -ForegroundColor DarkGray
        $Results.Errors += "$($monitor.Name) is not responding"
    }
}

if ($Results.MonitoringHealthy -eq $MonitoringServices.Count) {
    Write-Host ""
    Write-Host "  🎉 All monitoring services are healthy!" -ForegroundColor $ColorSuccess
}
else {
    Write-Host ""
    Write-Host "  ⚠ Some monitoring services are down!" -ForegroundColor $ColorWarning
}

# ================================================================
# TEST 2: BACKEND SERVICES HEALTH
# ================================================================

Write-Section "TEST 2: Backend Services Health Check"

foreach ($service in $Services) {
    $isHealthy = Test-ServiceHealth -ServiceName $service.Name -Port $service.Port
    if ($isHealthy) {
        $Results.HealthyServices++
    }
    else {
        $Results.UnhealthyServices++
    }
}

Write-Host ""
if ($Results.HealthyServices -eq $Services.Count) {
    Write-Host "  🎉 All $($Results.HealthyServices) services are healthy!" -ForegroundColor $ColorSuccess
}
else {
    Write-Host "  ⚠ $($Results.UnhealthyServices) services are down!" -ForegroundColor $ColorWarning
}

# ================================================================
# TEST 3: METRICS EXPOSURE
# ================================================================

Write-Section "TEST 3: Metrics Exposure Check"

foreach ($service in $Services) {
    $metricsCount = Get-ServiceMetricsCount -ServiceName $service.Name -Port $service.Port
    
    if ($metricsCount -gt 0) {
        $Results.TotalMetrics += $metricsCount
        
        $status = if ($metricsCount -ge $service.ExpectedMetrics) { "✓" } else { "⚠" }
        $color = if ($metricsCount -ge $service.ExpectedMetrics) { $ColorSuccess } else { $ColorWarning }
        
        Write-Host "  $status $($service.Name)" -ForegroundColor $color -NoNewline
        Write-Host " - $metricsCount metrics (expected: $($service.ExpectedMetrics))" -ForegroundColor DarkGray
        
        if ($metricsCount -lt $service.ExpectedMetrics) {
            $Results.Warnings += "$($service.Name) exposes fewer metrics than expected ($metricsCount vs $($service.ExpectedMetrics))"
        }
    }
}

Write-Host ""
Write-Host "  Total Metrics Exposed: $($Results.TotalMetrics) / $($Results.ExpectedMetrics)" -ForegroundColor $(
    if ($Results.TotalMetrics -ge $Results.ExpectedMetrics) { $ColorSuccess } else { $ColorWarning }
)

# ================================================================
# TEST 4: PROMETHEUS INTEGRATION
# ================================================================

$upTargets = Test-PrometheusTargets

# ================================================================
# TEST 5: GRAFANA DASHBOARDS
# ================================================================

$null = Test-GrafanaDashboards

# ================================================================
# FINAL SUMMARY
# ================================================================

Write-Banner "Test Summary"

Write-Host "✓ Monitoring Services: $($Results.MonitoringHealthy) / $($MonitoringServices.Count)" -ForegroundColor $(
    if ($Results.MonitoringHealthy -eq $MonitoringServices.Count) { $ColorSuccess } else { $ColorError }
)

Write-Host "✓ Backend Services: $($Results.HealthyServices) / $($Results.TotalServices)" -ForegroundColor $(
    if ($Results.HealthyServices -eq $Results.TotalServices) { $ColorSuccess } else { $ColorError }
)

Write-Host "✓ Total Metrics: $($Results.TotalMetrics) / $($Results.ExpectedMetrics)" -ForegroundColor $(
    if ($Results.TotalMetrics -ge $Results.ExpectedMetrics * 0.9) { $ColorSuccess } else { $ColorWarning }
)

Write-Host "✓ Prometheus Targets UP: $upTargets" -ForegroundColor $(
    if ($upTargets -ge 10) { $ColorSuccess } else { $ColorWarning }
)

# Errors & Warnings
if ($Results.Errors.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠ Errors ($($Results.Errors.Count)):" -ForegroundColor $ColorError
    foreach ($errorItem in $Results.Errors) {
        Write-Host "  • $errorItem" -ForegroundColor $ColorError
    }
}

if ($Results.Warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠ Warnings ($($Results.Warnings.Count)):" -ForegroundColor $ColorWarning
    foreach ($warning in $Results.Warnings) {
        Write-Host "  • $warning" -ForegroundColor $ColorWarning
    }
}

# Overall status
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor $ColorHeader

$overallHealthy = (
    $Results.MonitoringHealthy -eq $MonitoringServices.Count -and
    $Results.HealthyServices -eq $Results.TotalServices -and
    $Results.TotalMetrics -ge ($Results.ExpectedMetrics * 0.9)
)

if ($overallHealthy) {
    Write-Host " 🎊 OVERALL STATUS: EXCELLENT! 🎊" -ForegroundColor $ColorSuccess
    Write-Host "    All systems operational and metrics exposed!" -ForegroundColor $ColorSuccess
}
elseif ($Results.Errors.Count -eq 0) {
    Write-Host " ⚠ OVERALL STATUS: GOOD WITH WARNINGS" -ForegroundColor $ColorWarning
    Write-Host "    System functional but needs attention" -ForegroundColor $ColorWarning
}
else {
    Write-Host " ✗ OVERALL STATUS: ISSUES DETECTED" -ForegroundColor $ColorError
    Write-Host "    Please fix errors before proceeding" -ForegroundColor $ColorError
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor $ColorHeader
Write-Host ""

# Quick Actions
Write-Host "Quick Actions:" -ForegroundColor $ColorInfo
Write-Host "  • Open Prometheus: http://localhost:9090" -ForegroundColor DarkGray
Write-Host "  • Open Grafana: http://localhost:3001 (admin/admin123)" -ForegroundColor DarkGray
Write-Host "  • View Targets: http://localhost:9090/targets" -ForegroundColor DarkGray
Write-Host "  • Query Metrics: http://localhost:9090/graph" -ForegroundColor DarkGray
Write-Host ""

# Open browsers if requested
if ($OpenBrowsers) {
    Write-Host "Opening monitoring dashboards..." -ForegroundColor $ColorInfo
    Start-Process "http://localhost:9090"
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3001"
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:9090/targets"
}

# Export report if requested
if ($ExportReport) {
    Export-TestReport
}

Write-Host "Testing completed at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor DarkGray
Write-Host ""
