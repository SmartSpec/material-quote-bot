# Build and Upload Design Automation AppBundle
# Run this script on a Windows machine with .NET SDK and Visual Studio

param(
    [Parameter(Mandatory=$true)]
    [string]$APS_CLIENT_ID,

    [Parameter(Mandatory=$true)]
    [string]$APS_CLIENT_SECRET
)

Write-Host "=== Building MassProp Extractor AppBundle ===" -ForegroundColor Green

# Step 1: Build the .NET project
Write-Host "`nStep 1: Building .NET project..." -ForegroundColor Yellow
cd MassPropExtractor

dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to restore NuGet packages" -ForegroundColor Red
    exit 1
}

dotnet build --configuration Release
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build project" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful!" -ForegroundColor Green

# Step 2: Package the AppBundle
Write-Host "`nStep 2: Packaging AppBundle..." -ForegroundColor Yellow

$bundlePath = "MassPropExtractor.bundle"
Remove-Item -Path $bundlePath -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path "$bundlePath/Contents" -Force | Out-Null

Copy-Item "bin/Release/MassPropExtractor.dll" -Destination "$bundlePath/Contents/"
Copy-Item "PackageContents.xml" -Destination "$bundlePath/"

Compress-Archive -Path $bundlePath -DestinationPath "MassPropExtractor.zip" -Force

Write-Host "AppBundle packaged: MassPropExtractor.zip" -ForegroundColor Green

# Step 3: Get OAuth token
Write-Host "`nStep 3: Authenticating with Autodesk..." -ForegroundColor Yellow

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
Write-Host "Authentication successful!" -ForegroundColor Green

# Step 4: Upload AppBundle
Write-Host "`nStep 4: Uploading AppBundle to Design Automation..." -ForegroundColor Yellow

$appBundleName = "MassPropExtractor"
$appBundleAlias = "prod"

# Delete existing AppBundle if exists
try {
    Invoke-RestMethod -Uri "https://developer.api.autodesk.com/da/us-east/v3/appbundles/$appBundleName" `
        -Method Delete `
        -Headers @{ Authorization = "Bearer $accessToken" } `
        -ErrorAction SilentlyContinue
    Write-Host "Deleted existing AppBundle" -ForegroundColor Yellow
} catch {
    Write-Host "No existing AppBundle to delete" -ForegroundColor Gray
}

# Create new AppBundle with current engine
$appBundleSpec = @{
    id = $appBundleName
    engine = "Autodesk.AutoCAD+2024"
    description = "Extracts MASSPROP data from 3D solids in DWG files"
} | ConvertTo-Json

$createResponse = Invoke-RestMethod -Uri "https://developer.api.autodesk.com/da/us-east/v3/appbundles" `
    -Method Post `
    -Headers @{
        Authorization = "Bearer $accessToken"
        "Content-Type" = "application/json"
    } `
    -Body $appBundleSpec

Write-Host "AppBundle created with upload URL" -ForegroundColor Green

# Upload the ZIP file
$uploadUrl = $createResponse.uploadParameters.endpointURL
$formData = $createResponse.uploadParameters.formData

Write-Host "Uploading ZIP file..." -ForegroundColor Yellow

# Create multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$fileBytes = [System.IO.File]::ReadAllBytes("MassPropExtractor.zip")

$bodyLines = @()
foreach ($key in $formData.PSObject.Properties.Name) {
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"$key`""
    $bodyLines += ""
    $bodyLines += $formData.$key
}

$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"file`"; filename=`"MassPropExtractor.zip`""
$bodyLines += "Content-Type: application/zip"
$bodyLines += ""

$bodyString = ($bodyLines -join "`r`n") + "`r`n"
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyString)

$uploadData = $bodyBytes + $fileBytes + [System.Text.Encoding]::UTF8.GetBytes("`r`n--$boundary--`r`n")

Invoke-RestMethod -Uri $uploadUrl `
    -Method Post `
    -ContentType "multipart/form-data; boundary=$boundary" `
    -Body $uploadData

Write-Host "AppBundle uploaded successfully!" -ForegroundColor Green

# Step 5: Create alias
Write-Host "`nStep 5: Creating 'prod' alias..." -ForegroundColor Yellow

$aliasSpec = @{
    version = 1
    id = $appBundleAlias
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "https://developer.api.autodesk.com/da/us-east/v3/appbundles/$appBundleName/aliases" `
        -Method Post `
        -Headers @{
            Authorization = "Bearer $accessToken"
            "Content-Type" = "application/json"
        } `
        -Body $aliasSpec
    Write-Host "Alias 'prod' created!" -ForegroundColor Green
} catch {
    Write-Host "Alias might already exist, updating..." -ForegroundColor Yellow
    Invoke-RestMethod -Uri "https://developer.api.autodesk.com/da/us-east/v3/appbundles/$appBundleName/aliases/$appBundleAlias" `
        -Method Patch `
        -Headers @{
            Authorization = "Bearer $accessToken"
            "Content-Type" = "application/json"
        } `
        -Body $aliasSpec
    Write-Host "Alias 'prod' updated!" -ForegroundColor Green
}

# Step 6: Create Activity
Write-Host "`nStep 6: Creating Activity..." -ForegroundColor Yellow

$activityName = "ExtractMassPropActivity"

# Delete existing Activity if exists
try {
    Invoke-RestMethod -Uri "https://developer.api.autodesk.com/da/us-east/v3/activities/$activityName" `
        -Method Delete `
        -Headers @{ Authorization = "Bearer $accessToken" } `
        -ErrorAction SilentlyContinue
    Write-Host "Deleted existing Activity" -ForegroundColor Yellow
} catch {
    Write-Host "No existing Activity to delete" -ForegroundColor Gray
}

$activitySpec = @{
    id = $activityName
    commandLine = @('$(engine.path)\\accoreconsole.exe /i "$(args[InputDwg].path)" /al "$(appbundles[MassPropExtractor].path)" /s "$(settings[script].path)"')
    engine = "Autodesk.AutoCAD+2024"
    appbundles = @("$APS_CLIENT_ID.$appBundleName+$appBundleAlias")
    parameters = @{
        InputDwg = @{
            verb = "get"
            description = "Input DWG file"
            required = $true
            localName = "input.dwg"
        }
        OutputTxt = @{
            verb = "put"
            description = "Output text file with MASSPROP results"
            required = $true
            localName = "massprop_result.txt"
        }
    }
    settings = @{
        script = @{
            value = "EXTRACTMASSPROP`n"
        }
    }
} | ConvertTo-Json -Depth 10

$activityResponse = Invoke-RestMethod -Uri "https://developer.api.autodesk.com/da/us-east/v3/activities" `
    -Method Post `
    -Headers @{
        Authorization = "Bearer $accessToken"
        "Content-Type" = "application/json"
    } `
    -Body $activitySpec

Write-Host "Activity created!" -ForegroundColor Green

# Create Activity alias
$activityAliasSpec = @{
    version = 1
    id = "prod"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "https://developer.api.autodesk.com/da/us-east/v3/activities/$activityName/aliases" `
        -Method Post `
        -Headers @{
            Authorization = "Bearer $accessToken"
            "Content-Type" = "application/json"
        } `
        -Body $activityAliasSpec
    Write-Host "Activity alias 'prod' created!" -ForegroundColor Green
} catch {
    Write-Host "Activity alias updating..." -ForegroundColor Yellow
    Invoke-RestMethod -Uri "https://developer.api.autodesk.com/da/us-east/v3/activities/$activityName/aliases/prod" `
        -Method Patch `
        -Headers @{
            Authorization = "Bearer $accessToken"
            "Content-Type" = "application/json"
        } `
        -Body $activityAliasSpec
    Write-Host "Activity alias 'prod' updated!" -ForegroundColor Green
}

Write-Host "`n=== SETUP COMPLETE ===" -ForegroundColor Green
Write-Host "`nYour Design Automation Activity is ready!" -ForegroundColor Cyan
Write-Host "Activity ID: $env:APS_CLIENT_ID.$activityName+prod" -ForegroundColor Cyan
Write-Host "`nYou can now use this in your Edge Function to extract MASSPROP from DWG files." -ForegroundColor White
