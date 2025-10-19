param(
    [Parameter(Mandatory=$true)]
    [string]$APS_CLIENT_ID,
    [Parameter(Mandatory=$true)]
    [string]$APS_CLIENT_SECRET
)

# Get OAuth token
$authBody = @{
    grant_type = "client_credentials"
    client_id = $APS_CLIENT_ID
    client_secret = $APS_CLIENT_SECRET
    scope = "code:all"
}

$authResponse = Invoke-RestMethod -Uri "https://developer.api.autodesk.com/authentication/v2/token" `
    -Method Post `
    -ContentType "application/x-www-form-urlencoded" `
    -Body $authBody

$accessToken = $authResponse.access_token

# List available engines
Write-Host "Fetching available engines..." -ForegroundColor Yellow
$engines = Invoke-RestMethod -Uri "https://developer.api.autodesk.com/da/us-east/v3/engines" `
    -Method Get `
    -Headers @{ Authorization = "Bearer $accessToken" }

Write-Host "`nAll Available Engines:" -ForegroundColor Green
$engines.data | ForEach-Object {
    Write-Host "  - $($_.id)" -ForegroundColor Cyan
}

Write-Host "`nAutoCAD Engines Only:" -ForegroundColor Green
$autocadEngines = $engines.data | Where-Object { $_.id -like "*AutoCAD*" }
if ($autocadEngines.Count -eq 0) {
    Write-Host "  No AutoCAD engines found!" -ForegroundColor Red
    Write-Host "  Your account may need Design Automation for AutoCAD enabled." -ForegroundColor Yellow
} else {
    $autocadEngines | ForEach-Object {
        Write-Host "  - $($_.id)" -ForegroundColor Cyan
    }
}
