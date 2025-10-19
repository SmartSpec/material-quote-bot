# Download AutoCAD reference DLLs for Design Automation
# These are stub DLLs used only for compilation

Write-Host "Downloading AutoCAD reference DLLs..." -ForegroundColor Yellow

$refs = @(
    "https://github.com/Autodesk-Forge/design.automation-.net-custom.activity.sample/raw/master/References/accoremgd.dll",
    "https://github.com/Autodesk-Forge/design.automation-.net-custom.activity.sample/raw/master/References/acdbmgd.dll",
    "https://github.com/Autodesk-Forge/design.automation-.net-custom.activity.sample/raw/master/References/acmgd.dll"
)

cd MassPropExtractor

foreach ($url in $refs) {
    $filename = Split-Path $url -Leaf
    Write-Host "Downloading $filename..." -ForegroundColor Cyan

    try {
        Invoke-WebRequest -Uri $url -OutFile $filename -UseBasicParsing
        Write-Host "  Downloaded $filename" -ForegroundColor Green
    } catch {
        Write-Host "  Failed to download $filename" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }
}

Write-Host "All reference DLLs downloaded!" -ForegroundColor Green
Write-Host "You can now run the build script" -ForegroundColor Cyan
