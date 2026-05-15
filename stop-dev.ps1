$ports = @(8761, 9090, 8080, 9091, 9092, 9093, 9094, 9095, 9096, 5173)

foreach ($port in $ports) {
    $pid = (netstat -ano | Select-String ":$port " | Where-Object { $_ -match "LISTENING" } | ForEach-Object { ($_ -split '\s+')[-1] } | Select-Object -First 1)
    if ($pid) {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "Stopped port $port (PID $pid)"
    }
}

Write-Host "All services stopped."
