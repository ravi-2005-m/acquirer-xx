# AcquirerX - Start All Services
# Usage: .\start-all.ps1
# Prerequisites: Java 17+, Maven, MySQL running on localhost:3306 (user: root, pass: root)

$ROOT = $PSScriptRoot

# ── helpers ────────────────────────────────────────────────────────────────────
function Check-Command($cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

function Wait-ForPort($port, $label, $timeoutSec = 60) {
    Write-Host "  Waiting for $label on port $port..." -NoNewline
    $deadline = (Get-Date).AddSeconds($timeoutSec)
    while ((Get-Date) -lt $deadline) {
        $conn = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if ($conn.TcpTestSucceeded) { Write-Host " ready." ; return $true }
        Start-Sleep -Seconds 2
        Write-Host "." -NoNewline
    }
    Write-Host " TIMEOUT." ; return $false
}

function Start-Service($name, $jar, $label) {
    Write-Host "`n>> Starting $label..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT'; java -jar '$jar'; Read-Host 'Press Enter to close'" -WindowStyle Normal
}

# ── preflight ──────────────────────────────────────────────────────────────────
Write-Host "=== AcquirerX Startup ===" -ForegroundColor Cyan

if (-not (Check-Command java))  { Write-Host "[ERROR] java not found. Install JDK 17+." -ForegroundColor Red; exit 1 }
if (-not (Check-Command mvn))   { Write-Host "[ERROR] mvn not found. Install Maven." -ForegroundColor Red; exit 1 }

# ── Maven build ────────────────────────────────────────────────────────────────
Write-Host "`n[1/2] Building all services (skipping tests)..."
Set-Location $ROOT
mvn -DskipTests package -q
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Maven build failed. Fix errors above and retry." -ForegroundColor Red
    exit 1
}
Write-Host "  Build successful." -ForegroundColor Green

# ── Start services ─────────────────────────────────────────────────────────────
Write-Host "`n[2/2] Starting services..."

# 1. Eureka (everything depends on this)
Start-Service "eureka" "$ROOT\eureka-server\target\eureka-server-0.0.1-SNAPSHOT.jar" "Eureka Server :8761"
Wait-ForPort 8761 "Eureka" 90

# 2. API Gateway
Start-Service "gateway" "$ROOT\api-gateway\target\api-gateway-0.0.1-SNAPSHOT.jar" "API Gateway :9090"
Wait-ForPort 9090 "API Gateway" 60

# 3. Auth Service
Start-Service "auth" "$ROOT\auth-service\target\auth-service-0.0.1-SNAPSHOT.jar" "Auth Service :9099"

# 4-9. Business services (start in parallel, no strict order after auth)
$services = @(
    @{ jar = "merchant-service\target\merchant-service-0.0.1-SNAPSHOT.jar";    label = "Merchant Service :9091" },
    @{ jar = "terminal-service\target\terminal-service-0.0.1-SNAPSHOT.jar";    label = "Terminal Service :9092" },
    @{ jar = "transaction-service\target\transaction-service-0.0.1-SNAPSHOT.jar"; label = "Transaction Service :9093" },
    @{ jar = "risk-service\target\risk-service-0.0.1-SNAPSHOT.jar";            label = "Risk Service :9094" },
    @{ jar = "settlement-service\target\settlement-service-0.0.1-SNAPSHOT.jar"; label = "Settlement Service :9095" },
    @{ jar = "ops-service\target\ops-service-0.0.1-SNAPSHOT.jar";              label = "Ops Service :9096" }
)

foreach ($svc in $services) {
    Start-Service ($svc.label) "$ROOT\$($svc.jar)" $svc.label
    Start-Sleep -Seconds 2
}

# 10. Frontend
Write-Host "`n>> Starting Frontend (Vite dev server :5173)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT\frontend'; npm install; npm run dev" -WindowStyle Normal

# ── Summary ────────────────────────────────────────────────────────────────────
Write-Host "`n=== All services launched ===" -ForegroundColor Green
Write-Host ""
Write-Host "  Eureka Dashboard  : http://localhost:8761"
Write-Host "  API Gateway       : http://localhost:9090"
Write-Host "  Frontend          : http://localhost:5173"
Write-Host ""
Write-Host "Each service runs in its own PowerShell window."
Write-Host "Close those windows (or Ctrl+C in each) to stop services."
