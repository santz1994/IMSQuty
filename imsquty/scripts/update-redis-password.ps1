# Update Redis Password to "redislabs" in all .env files
Write-Host "🔧 Updating Redis passwords to 'redislabs' in all .env files..." -ForegroundColor Cyan

$files = @(
    "d:\Project\ITQuty\imsquty\.env",
    "d:\Project\ITQuty\imsquty\.env.example",
    "d:\Project\ITQuty\imsquty\services\auth-service\.env",
    "d:\Project\ITQuty\imsquty\services\auth-service\.env.example",
    "d:\Project\ITQuty\imsquty\services\user-service\.env",
    "d:\Project\ITQuty\imsquty\services\user-service\.env.example",
    "d:\Project\ITQuty\imsquty\services\asset-service\.env",
    "d:\Project\ITQuty\imsquty\services\asset-service\.env.example",
    "d:\Project\ITQuty\imsquty\services\ticket-service\.env",
    "d:\Project\ITQuty\imsquty\services\ticket-service\.env.example",
    "d:\Project\ITQuty\imsquty\services\inventory-service\.env",
    "d:\Project\ITQuty\imsquty\services\inventory-service\.env.example",
    "d:\Project\ITQuty\imsquty\services\financial-service\.env",
    "d:\Project\ITQuty\imsquty\services\financial-service\.env.example",
    "d:\Project\ITQuty\imsquty\services\meeting-room-service\.env",
    "d:\Project\ITQuty\imsquty\services\meeting-room-service\.env.example",
    "d:\Project\ITQuty\imsquty\services\master-data-service\.env",
    "d:\Project\ITQuty\imsquty\services\master-data-service\.env.example",
    "d:\Project\ITQuty\imsquty\services\reporting-service\.env",
    "d:\Project\ITQuty\imsquty\services\reporting-service\.env.example",
    "d:\Project\ITQuty\imsquty\services\notification-service\.env",
    "d:\Project\ITQuty\imsquty\services\notification-service\.env.example"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace 'REDIS_PASSWORD=.*', 'REDIS_PASSWORD=redislabs'
        Set-Content -Path $file -Value $content -NoNewline
        Write-Host "✅ Updated: $file" -ForegroundColor Green
    }
    else {
        Write-Host "Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "All Redis passwords updated to redislabs" -ForegroundColor Green
