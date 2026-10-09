$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path $PSScriptRoot -Parent
$destination = Join-Path $projectRoot 'AlgebraQuest-AndroidStudio.zip'

if (Test-Path $destination) {
    $suffix = Get-Date -Format 'yyyyMMdd-HHmmss'
    $destination = Join-Path $projectRoot "AlgebraQuest-AndroidStudio-$suffix.zip"
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::Open(
    $destination,
    [System.IO.Compression.ZipArchiveMode]::Create
)

try {
    $files = Get-ChildItem -LiteralPath $projectRoot -Force -Recurse -File | Where-Object {
        $relativePath = $_.FullName.Substring($projectRoot.Length).TrimStart('\')
        $parts = $relativePath -split '[\\/]'

        $parts -notcontains '.git' -and
        $parts -notcontains '.vscode' -and
        $parts -notcontains '.gradle' -and
        $relativePath -ne 'api\config.php' -and
        $relativePath -ne 'local.properties' -and
        $relativePath -notlike 'app\build\*' -and
        $_.Extension -notin @('.zip', '.jks', '.keystore')
    }

    foreach ($file in $files) {
        $relativePath = $file.FullName.Substring($projectRoot.Length).TrimStart('\')
        $entryName = 'AlgebraQuest/' + $relativePath.Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $archive,
            $file.FullName,
            $entryName,
            [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
    }
} finally {
    $archive.Dispose()
}

$check = [System.IO.Compression.ZipFile]::OpenRead($destination)
try {
    $entries = @($check.Entries | ForEach-Object FullName)
    $required = @(
        'AlgebraQuest/settings.gradle.kts',
        'AlgebraQuest/gradlew.bat',
        'AlgebraQuest/app/src/main/AndroidManifest.xml',
        'AlgebraQuest/app/src/main/java/com/algebraquest/android/MainActivity.java',
        'AlgebraQuest/README_ANDROID.md',
        'AlgebraQuest/api/config.example.php'
    )
    $missing = @($required | Where-Object { $entries -notcontains $_ })
    $privateConfigIncluded = $entries -contains 'AlgebraQuest/api/config.php'

    if ($missing.Count -gt 0 -or $privateConfigIncluded) {
        throw "ZIP validation failed. Missing: $($missing -join ', '); private config included: $privateConfigIncluded"
    }

    $sizeMb = [math]::Round((Get-Item $destination).Length / 1MB, 2)
    Write-Output "Created: $destination"
    Write-Output "Files: $($entries.Count); size: $sizeMb MB; private database config excluded."
} finally {
    $check.Dispose()
}