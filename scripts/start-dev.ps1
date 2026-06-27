param()

$ErrorActionPreference = "Stop"

function Write-Report {
    param(
        [string]$BackendStatus,
        [string]$ApiStatus,
        [string]$FrontendStatus,
        [string]$BrowserUrl
    )

    Write-Host ""
    Write-Host "backend: $BackendStatus"
    Write-Host "API diagnostic: $ApiStatus"
    Write-Host "frontend: $FrontendStatus"
    Write-Host "browser: $BrowserUrl"
}

function Get-ProjectRoot {
    return (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

function Assert-ProjectLayout {
    param([string]$Root)

    $required = @(
        (Join-Path $Root "backend\app\main.py"),
        (Join-Path $Root "frontend\package.json"),
        (Join-Path $Root "scripts\check_api.py")
    )

    foreach ($path in $required) {
        if (-not (Test-Path $path)) {
            throw "Missing required file: $path"
        }
    }
}

function Ensure-FrontendEnv {
    param([string]$Root)

    $envPath = Join-Path $Root "frontend\.env.local"
    $desiredLine = "VITE_API_URL=http://127.0.0.1:8001"
    $lines = @()

    if (Test-Path $envPath) {
        $lines = Get-Content $envPath
        $filtered = $lines | Where-Object { $_ -notmatch '^VITE_API_URL=' }
        $filtered += $desiredLine
        Set-Content -Path $envPath -Value $filtered -Encoding UTF8
    } else {
        Set-Content -Path $envPath -Value $desiredLine -Encoding UTF8
    }
}

function Start-BackendWindow {
    param([string]$Root)

    $backendDir = Join-Path $Root "backend"
    $backendCommand = "Set-Location -LiteralPath '$backendDir'; python -m uvicorn app.main:app --reload --port 8001"
    Start-Process -FilePath "powershell.exe" `
        -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", $backendCommand) `
        -WorkingDirectory $backendDir
}

function Start-FrontendWindow {
    param([string]$Root)

    $frontendDir = Join-Path $Root "frontend"
    $frontendCommand = "Set-Location -LiteralPath '$frontendDir'; npm run dev -- --host 127.0.0.1"
    Start-Process -FilePath "powershell.exe" `
        -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-NoExit", "-Command", $frontendCommand) `
        -WorkingDirectory $frontendDir
}

function Wait-ForBackend {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 20
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                return $true
            }
        } catch {
            Start-Sleep -Milliseconds 500
        }
    } while ((Get-Date) -lt $deadline)

    return $false
}

function Test-ApiDiagnostic {
    param([string]$Root)

    $scriptPath = Join-Path $Root "scripts\check_api.py"
    $output = & python $scriptPath --base-url http://127.0.0.1:8001 2>&1
    $exitCode = $LASTEXITCODE
    if ($output) {
        $output | ForEach-Object { Write-Host $_ }
    }
    return [pscustomobject]@{
        ExitCode = $exitCode
        Output   = $output
    }
}

$root = Get-ProjectRoot
Assert-ProjectLayout -Root $root
Ensure-FrontendEnv -Root $root

Start-BackendWindow -Root $root

$backendReady = Wait-ForBackend -Url "http://127.0.0.1:8001/api/health" -TimeoutSeconds 20
if (-not $backendReady) {
    Write-Host "Backend не запустился на 8001."
    Write-Host "Проверьте окно backend."
    exit 1
}

$diagnostic = Test-ApiDiagnostic -Root $root
if ($diagnostic.ExitCode -ne 0) {
    Write-Host "API diagnostic failed."
    exit 1
}

Start-FrontendWindow -Root $root
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Report -BackendStatus "started on 8001" -ApiStatus "passed" -FrontendStatus "starting on 5173" -BrowserUrl "http://localhost:5173/"
