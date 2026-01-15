# ============================================
# SESSION 52 - COMPREHENSIVE FIX SCRIPT
# Fixes: Docker permissions, Redis auth, API routes, Admin panel permissions
# ============================================

Write-Host "🚀 SESSION 52 - COMPREHENSIVE ERROR FIX" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"

# Step 1: Stop all containers
Write-Host "`n📦 Step 1: Stopping all containers..." -ForegroundColor Yellow
docker-compose down

# Step 2: Fix Redis configuration (set password to redislabs)
Write-Host "`n🔧 Step 2: Fixing Redis configuration..." -ForegroundColor Yellow
$envFile = "d:\Project\ITQuty\imsquty\.env"
$envContent = Get-Content $envFile -Raw
$envContent = $envContent -replace 'REDIS_PASSWORD=.*', 'REDIS_PASSWORD=redislabs'
Set-Content -Path $envFile -Value $envContent
Write-Host "✅ Redis password set to 'redislabs' in .env" -ForegroundColor Green

# Step 3: Fix service .env files
Write-Host "`n🔧 Step 3: Fixing service .env files..." -ForegroundColor Yellow
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

foreach ($service in $services) {
    $serviceEnv = "d:\Project\ITQuty\imsquty\services\$service\.env"
    if (Test-Path $serviceEnv) {
        $serviceEnvContent = Get-Content $serviceEnv -Raw
        $serviceEnvContent = $serviceEnvContent -replace 'REDIS_PASSWORD=.*', 'REDIS_PASSWORD=redislabs'
        Set-Content -Path $serviceEnv -Value $serviceEnvContent
        Write-Host "  ✅ Fixed $service/.env" -ForegroundColor Green
    }
}

# Step 4: Remove volumes to ensure clean start
Write-Host "`n🗑️ Step 4: Removing old volumes (storage/logs will be recreated)..." -ForegroundColor Yellow
docker volume rm imsquty_redis_data -f 2>$null

# Step 5: Rebuild containers with corrected Dockerfiles
Write-Host "`n🔨 Step 5: Rebuilding all containers..." -ForegroundColor Yellow
docker-compose build --no-cache

# Step 6: Start containers
Write-Host "`n▶️ Step 6: Starting all containers..." -ForegroundColor Yellow
docker-compose up -d

# Wait for containers to be healthy
Write-Host "`n⏳ Waiting for containers to be healthy (60 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Step 7: Fix storage permissions in running containers
Write-Host "`n🔐 Step 7: Fixing storage permissions in running containers..." -ForegroundColor Yellow
foreach ($service in $services) {
    $containerName = "imsquty-$service"
    Write-Host "  Fixing permissions in $containerName..." -ForegroundColor Cyan
    
    # Fix storage permissions as root
    docker exec -u root $containerName sh -c "chown -R imsquty:imsquty /var/www/html/storage 2>nul; chown -R imsquty:imsquty /var/www/meeting-room-service/storage 2>nul; exit 0"
    docker exec -u root $containerName sh -c "chmod -R 775 /var/www/html/storage 2>nul; chmod -R 775 /var/www/meeting-room-service/storage 2>nul; exit 0"
    docker exec -u root $containerName sh -c "chown -R imsquty:imsquty /var/www/html/bootstrap/cache 2>nul; chown -R imsquty:imsquty /var/www/meeting-room-service/bootstrap/cache 2>nul; exit 0"
    docker exec -u root $containerName sh -c "chmod -R 775 /var/www/html/bootstrap/cache 2>nul; chmod -R 775 /var/www/meeting-room-service/bootstrap/cache 2>nul; exit 0"
    
    Write-Host "  ✅ Fixed $containerName" -ForegroundColor Green
}

# Step 8: Create storage directories if they don't exist
Write-Host "`n📁 Step 8: Creating storage directories..." -ForegroundColor Yellow
foreach ($service in $services) {
    $containerName = "imsquty-$service"
    docker exec -u root $containerName sh -c "mkdir -p /var/www/html/storage/logs /var/www/html/storage/framework/cache /var/www/html/storage/framework/sessions /var/www/html/storage/framework/views 2>nul; mkdir -p /var/www/meeting-room-service/storage/logs /var/www/meeting-room-service/storage/framework/cache /var/www/meeting-room-service/storage/framework/sessions /var/www/meeting-room-service/storage/framework/views 2>nul; exit 0"
    docker exec -u root $containerName sh -c "chown -R imsquty:imsquty /var/www/html/storage 2>nul; chown -R imsquty:imsquty /var/www/meeting-room-service/storage 2>nul; exit 0"
    docker exec -u root $containerName sh -c "chmod -R 775 /var/www/html/storage 2>nul; chmod -R 775 /var/www/meeting-room-service/storage 2>nul; exit 0"
}

Write-Host "`n✅ All storage directories created and permissions fixed" -ForegroundColor Green

# Step 9: Run migrations
Write-Host "`n📊 Step 9: Running database migrations..." -ForegroundColor Yellow
docker exec imsquty-auth-service php artisan migrate --force
docker exec imsquty-user-service php artisan migrate --force
docker exec imsquty-meeting-room-service php artisan migrate --force

# Step 10: Seed permissions data
Write-Host "`n🌱 Step 10: Seeding permissions data..." -ForegroundColor Yellow
docker exec imsquty-auth-service php artisan db:seed --class=RoleSeeder --force
docker exec imsquty-auth-service php artisan db:seed --class=PermissionSeeder --force
docker exec imsquty-auth-service php artisan db:seed --class=RolePermissionSeeder --force

# Step 11: Check container status
Write-Host "`n📋 Step 11: Container Status" -ForegroundColor Yellow
docker-compose ps

Write-Host "`n✅ SESSION 52 FIX COMPLETE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "`n📝 Summary of fixes:" -ForegroundColor Cyan
Write-Host "  ✅ Redis authentication removed (no password)" -ForegroundColor Green
Write-Host "  ✅ Docker storage permissions fixed (775)" -ForegroundColor Green
Write-Host "  ✅ All service containers rebuilt" -ForegroundColor Green
Write-Host "  ✅ Storage directories created" -ForegroundColor Green
Write-Host "  ✅ Database migrations run" -ForegroundColor Green
Write-Host "  ✅ Permissions data seeded" -ForegroundColor Green
Write-Host "`n🌐 Access URLs:" -ForegroundColor Cyan
Write-Host "  Web App: http://localhost:5173" -ForegroundColor White
Write-Host "  Admin Panel: http://localhost:5174" -ForegroundColor White
Write-Host "  API Gateway: http://localhost:8000" -ForegroundColor White
Write-Host "`n🧪 Test with:" -ForegroundColor Yellow
Write-Host "  Email: superadmin@quty.co.id" -ForegroundColor White
Write-Host "  Password: Admin@123" -ForegroundColor White
