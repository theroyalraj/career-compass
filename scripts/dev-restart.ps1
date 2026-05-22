# Stop the previous Next.js dev port and start again (Windows PowerShell).
# Starts Postgres via "docker compose up -d db" (data volume preserved).
# Restarts Redis (stops container → discards all cache → starts fresh).
# NEVER touches the app container or runs compose down / -v.
# Run from repo root: npm run restart
# Or: powershell -ExecutionPolicy Bypass -NoProfile -File scripts/dev-restart.ps1

# Native tools (node/npx) write to stderr; "Stop" turns that into terminating errors on Windows PS 5.1.
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

$portFile = Join-Path $Root ".dev-port"
if (Test-Path $portFile) {
  $raw = Get-Content $portFile -Raw
  if ($raw -match "PORT=(\d+)") {
    Stop-ListenerOnPort ([int]$Matches[1])
  }
}

Write-Host "docker compose up -d db (data volume preserved; never tearing down stack here)..."
docker compose up -d db
if ($LASTEXITCODE -ne 0) {
  Write-Warning "docker compose up -d db failed - is Docker Desktop running?"
}

# ── Redis: stop existing container (flushes in-memory cache) then start fresh ──
Write-Host "Restarting Redis (clears all cache)..." -ForegroundColor Magenta
docker compose stop redis 2>$null | Out-Null
docker compose rm -f redis 2>$null | Out-Null
docker compose up -d redis
if ($LASTEXITCODE -ne 0) {
  Write-Warning "Redis failed to start - continuing without cache layer."
} else {
  # Wait up to 30 s for Redis to become ready
  $redisReady = $false
  for ($r = 0; $r -lt 15; $r++) {
    $ping = docker compose exec -T redis redis-cli ping 2>$null
    if ($ping -eq "PONG") { $redisReady = $true; break }
    Start-Sleep -Seconds 2
  }
  if ($redisReady) {
    Write-Host "Redis is ready and cache is clean." -ForegroundColor Green
  } else {
    Write-Warning "Redis did not respond to PING in time - check 'docker compose logs redis'."
  }
}

Write-Host "Waiting for Postgres (localhost:5435)..."
$ready = $false
for ($i = 0; $i -lt 36; $i++) {
  if (Test-NetConnection -ComputerName localhost -Port 5435 -WarningAction SilentlyContinue | Select-Object -ExpandProperty TcpTestSucceeded) {
    $ready = $true
    break
  }
  Start-Sleep -Seconds 2
}

if (-not $ready) {
  Write-Warning "Postgres not reachable on localhost:5435. Run: npm run db:up"
} else {
  Write-Host "prisma migrate deploy..."
  npx prisma migrate deploy
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "migrate deploy failed. Fix DB/migrations then run: npx prisma migrate deploy"
  } else {
    Write-Host "prisma db seed..."
    npx prisma db seed
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "db seed failed. Run: npm run db:seed"
    }
  }
}

$newPort = 3000
Write-Host "Ensuring port $newPort is clean..."
Stop-ListenerOnPort $newPort

Set-Content -Path $portFile -Value "PORT=$newPort" -NoNewline
Write-Host "Stopping previous Sensei AI Tutor instances..."
Stop-ListenerOnPort 3847
Stop-ListenerOnPort 3848

Write-Host "Starting Sensei AI Tutor (Brain & Gateway) in background..." -ForegroundColor Cyan
Start-Process node -ArgumentList "pc-agent/src/server.js" -WorkingDirectory "sensei" -WindowStyle Hidden
Start-Process node -ArgumentList "skill-gateway/src/server.js" -WorkingDirectory "sensei" -WindowStyle Hidden

Write-Host ""
Write-Host "Starting Next.js on http://localhost:$newPort" -ForegroundColor Green
Write-Host ""

npx next dev -p $newPort
