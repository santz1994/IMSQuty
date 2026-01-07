# PowerShell Script to Start IMSQuty Monitoring Stack
# Run this script to start all monitoring services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " IMSQuty Monitoring Stack Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "[1/5] Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if network exists, create if not
Write-Host "[2/5] Checking Docker network..." -ForegroundColor Yellow
$networkExists = docker network ls --filter name=imsquty-network --format "{{.Name}}"
if ($networkExists -eq "imsquty-network") {
    Write-Host "✓ Network 'imsquty-network' exists" -ForegroundColor Green
}
else {
    Write-Host "Creating network 'imsquty-network'..." -ForegroundColor Yellow
    docker network create imsquty-network
    Write-Host "✓ Network created" -ForegroundColor Green
}

# Start monitoring services
Write-Host "[3/5] Starting monitoring services..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to be healthy
Write-Host "[4/5] Waiting for services to be healthy..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host "[5/5] Checking service status..." -ForegroundColor Yellow
Write-Host ""

$services = @(
    @{Name = "Prometheus"; Port = 9090; URL = "http://localhost:9090" },
    @{Name = "Alertmanager"; Port = 9093; URL = "http://localhost:9093" },
    @{Name = "Grafana"; Port = 3001; URL = "http://localhost:3001" },
    @{Name = "Elasticsearch"; Port = 9200; URL = "http://localhost:9200" },
    @{Name = "Logstash"; Port = 5000; URL = "http://localhost:5000" },
    @{Name = "Kibana"; Port = 5601; URL = "http://localhost:5601" },
    @{Name = "Jaeger"; Port = 16686; URL = "http://localhost:16686" },
    @{Name = "Node Exporter"; Port = 9100; URL = "http://localhost:9100" },
    @{Name = "cAdvisor"; Port = 8081; URL = "http://localhost:8081" },
    @{Name = "MySQL Exporter"; Port = 9104; URL = "http://localhost:9104" },
    @{Name = "Redis Exporter"; Port = 9121; URL = "http://localhost:9121" }
)

Write-Host "Service Status:" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

foreach ($service in $services) {
    $containerName = "imsquty-" + ($service.Name -replace ' ', '-').ToLower()
    $status = docker inspect --format='{{.State.Status}}' $containerName 2>$null
    
    if ($status -eq "running") {
        Write-Host "✓ $($service.Name.PadRight(20)) Running on port $($service.Port)" -ForegroundColor Green
    }
    else {
        Write-Host "✗ $($service.Name.PadRight(20)) Not running" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# Display access URLs
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""
Write-Host "Dashboards:" -ForegroundColor Yellow
Write-Host "  • Grafana:     http://localhost:3001 (admin/admin123)" -ForegroundColor White
Write-Host "  • Prometheus:  http://localhost:9090" -ForegroundColor White
Write-Host "  • Kibana:      http://localhost:5601" -ForegroundColor White
Write-Host "  • Jaeger:      http://localhost:16686" -ForegroundColor White
Write-Host ""
Write-Host "Metrics:" -ForegroundColor Yellow
Write-Host "  • Node:        http://localhost:9100/metrics" -ForegroundColor White
Write-Host "  • cAdvisor:    http://localhost:8081" -ForegroundColor White
Write-Host "  • MySQL:       http://localhost:9104/metrics" -ForegroundColor White
Write-Host "  • Redis:       http://localhost:9121/metrics" -ForegroundColor White
Write-Host ""
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Wait 30-60 seconds for all services to fully initialize" -ForegroundColor White
Write-Host "2. Access Grafana and explore the 5 pre-configured dashboards" -ForegroundColor White
Write-Host "3. Check Prometheus targets: http://localhost:9090/targets" -ForegroundColor White
Write-Host "4. Configure log shipping from microservices to Logstash" -ForegroundColor White
Write-Host "5. Add /metrics endpoints to all microservices" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Monitoring Stack Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
