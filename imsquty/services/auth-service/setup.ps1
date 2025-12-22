# Auth Service - Setup Script
# Run this script to initialize the Auth Service

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Auth Service Setup - IMSQuty" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$servicePath = "d:\Project\ITQuty\itquty-microservices\services\auth-service"

# Check if we're in the right directory
if (-not (Test-Path $servicePath)) {
    Write-Host "❌ Error: Auth service directory not found!" -ForegroundColor Red
    Write-Host "   Expected: $servicePath" -ForegroundColor Yellow
    exit 1
}

cd $servicePath

# Step 1: Install Composer Dependencies
Write-Host "📦 Step 1: Installing Composer dependencies..." -ForegroundColor Yellow
if (Test-Path "composer.json") {
    composer install --no-interaction
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Composer dependencies installed" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Failed to install Composer dependencies" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "⚠️  composer.json not found. Initializing Laravel project..." -ForegroundColor Yellow
    composer create-project laravel/laravel . "^10.0" --prefer-dist
    
    # Install additional packages
    composer require tymon/jwt-auth:^2.0
    composer require spatie/laravel-permission:^5.11
    composer require predis/predis:^2.2
}

Write-Host ""

# Step 2: Setup Environment File
Write-Host "⚙️  Step 2: Setting up environment file..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created from .env.example" -ForegroundColor Green
}
else {
    Write-Host "⚠️  .env already exists, skipping..." -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Generate Application Key
Write-Host "🔑 Step 3: Generating application key..." -ForegroundColor Yellow
php artisan key:generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Application key generated" -ForegroundColor Green
}
else {
    Write-Host "❌ Failed to generate application key" -ForegroundColor Red
}

Write-Host ""

# Step 4: Generate JWT Secret
Write-Host "🔐 Step 4: Generating JWT secret..." -ForegroundColor Yellow
php artisan jwt:secret
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ JWT secret generated" -ForegroundColor Green
}
else {
    Write-Host "⚠️  JWT secret generation failed (package may need to be installed)" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Run Migrations
Write-Host "🗄️  Step 5: Running database migrations..." -ForegroundColor Yellow
$dbCheck = php artisan migrate --force 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migrations completed successfully" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Migration warning: $dbCheck" -ForegroundColor Yellow
    Write-Host "   Make sure database 'imstest_quty' exists" -ForegroundColor Gray
}

Write-Host ""

# Step 6: Clear Caches
Write-Host "🧹 Step 6: Clearing application cache..." -ForegroundColor Yellow
php artisan config:clear
php artisan cache:clear
php artisan route:clear
Write-Host "✅ Cache cleared" -ForegroundColor Green

Write-Host ""

# Step 7: Run Tests
Write-Host "🧪 Step 7: Running tests..." -ForegroundColor Yellow
$testResult = php artisan test --coverage 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
    Write-Host $testResult
}
else {
    Write-Host "⚠️  Some tests may have failed" -ForegroundColor Yellow
    Write-Host $testResult
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✨ Auth Service Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Verify database connection in .env" -ForegroundColor White
Write-Host "   2. Start the service: php artisan serve --port=8001" -ForegroundColor White
Write-Host "   3. Test login endpoint:" -ForegroundColor White
Write-Host "      curl -X POST http://localhost:8001/api/v1/auth/login \" -ForegroundColor Gray
Write-Host "        -H 'Content-Type: application/json' \" -ForegroundColor Gray
Write-Host "        -d '{\"email\":\"admin@quty.co.id\",\"password\":\"123456\"}'" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentation: README.md" -ForegroundColor Cyan
Write-Host ""
