# Design Automation AppBundle for MASSPROP Extraction

This folder contains the .NET plugin that runs in AutoCAD via Design Automation to extract mass properties from DWG files.

## What It Does

The `EXTRACTMASSPROP` command:
1. Finds all 3D solids in the DWG file
2. Calculates volume and surface area for each solid using AutoCAD's MassProperties API
3. Calculates overall bounding box dimensions
4. Outputs results to `massprop_result.txt` in JSON format

## Building the AppBundle

### Prerequisites
- Visual Studio 2019 or later
- .NET Framework 4.8
- AutoCAD 2024 (for local testing)

### Build Steps

1. **Open the project:**
   ```bash
   cd DesignAutomation/MassPropExtractor
   ```

2. **Restore NuGet packages:**
   ```bash
   dotnet restore
   ```

3. **Build the project:**
   ```bash
   dotnet build --configuration Release
   ```

4. **Create the AppBundle ZIP:**
   ```bash
   # The bundle structure should be:
   # MassPropExtractor.bundle/
   #   ├── PackageContents.xml
   #   └── Contents/
   #       └── MassPropExtractor.dll
   ```

### Packaging Script

Run this PowerShell script to package the AppBundle:

```powershell
# Create bundle structure
$bundlePath = "MassPropExtractor.bundle"
Remove-Item -Path $bundlePath -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path "$bundlePath/Contents"

# Copy files
Copy-Item "bin/Release/net48/MassPropExtractor.dll" -Destination "$bundlePath/Contents/"
Copy-Item "PackageContents.xml" -Destination "$bundlePath/"

# Create ZIP
Compress-Archive -Path $bundlePath -DestinationPath "MassPropExtractor.zip" -Force

Write-Host "AppBundle created: MassPropExtractor.zip"
```

## Uploading to Design Automation

Once built, the AppBundle needs to be uploaded to Autodesk Platform Services:

```javascript
// This will be handled by the Edge Function
// See: supabase/functions/analyze-cad/upload-appbundle.ts
```

## Testing Locally

1. Load the DLL into AutoCAD:
   ```
   NETLOAD MassPropExtractor.dll
   ```

2. Run the command:
   ```
   EXTRACTMASSPROP
   ```

3. Check the output file:
   ```
   massprop_result.txt
   ```

## Output Format

```json
{
  "solidCount": 5,
  "totalVolume": 125000.5,
  "totalSurfaceArea": 15000.25,
  "boundingBox": {
    "length": 100.0,
    "width": 50.0,
    "height": 25.0
  }
}
```

## Notes

- The plugin only processes 3D Solids (`Solid3d` objects)
- All measurements are in drawing units
- Volume is in cubic units, area in square units
