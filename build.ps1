$AppName = "Storage Openkore Latam"
$OutputDir = "build"

Write-Host "🧹 Limpando build..."
Remove-Item -Recurse -Force $OutputDir -ErrorAction Ignore

Write-Host "🔨 Build x64..."
$env:GOOS="windows"
$env:GOARCH="amd64"
wails build -o "$OutputDir/$AppName-x64.exe"

Write-Host "🔨 Build x86..."
$env:GOOS="windows"
$env:GOARCH="386"
wails build -o "$OutputDir/$AppName-x86.exe"

Write-Host "✅ Builds concluídos!"
