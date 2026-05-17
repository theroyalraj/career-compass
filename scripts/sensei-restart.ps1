# Stop the previous Sensei AI Tutor instances and start again (Windows PowerShell).
# Run from repo root: npm run sensei:restart
# Or: powershell -ExecutionPolicy Bypass -NoProfile -File scripts/sensei-restart.ps1

$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Stop-ListenerOnPort([int] $Port) {
  try {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
      if ($c.OwningProcess) {
        Write-Host "Stopping process $($c.OwningProcess) on port $Port"
        Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
      }
    }
  } catch {
    Write-Host "(Could not query port $Port - continue)"
  }
}

Write-Host "Stopping previous Sensei AI Tutor instances..." -ForegroundColor Yellow
Stop-ListenerOnPort 3847
Stop-ListenerOnPort 3848

try {
  Get-CimInstance Win32_Process -Filter "Name like 'python%'" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*sensei-listen.py*" -or $_.CommandLine -like "*sensei-companion.py*" } | ForEach-Object {
    Write-Host "Stopping previous python process $($_.ProcessId) ($($_.CommandLine))"
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
} catch {
  Write-Host "(Could not query python processes - continue)"
}

Write-Host "Starting Sensei AI Tutor (Brain, Gateway, Voice & Companion Daemon) in background..." -ForegroundColor Cyan
Start-Process node -ArgumentList "pc-agent/src/server.js" -WorkingDirectory "sensei" -WindowStyle Hidden
Start-Process node -ArgumentList "skill-gateway/src/server.js" -WorkingDirectory "sensei" -WindowStyle Hidden
Start-Process python -ArgumentList "scripts/sensei-listen.py" -WorkingDirectory "sensei" -WindowStyle Hidden
Start-Process python -ArgumentList "scripts/sensei-companion.py" -WorkingDirectory "sensei" -WindowStyle Hidden

Write-Host "Sensei AI Tutor has been soft-restarted successfully!" -ForegroundColor Green
