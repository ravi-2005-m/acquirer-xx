$root = $PSScriptRoot


$services = @(
    @{ title = "Eureka";       dir = "eureka-server";       cmd = "mvn spring-boot:run" },
    @{ title = "API Gateway";  dir = "api-gateway";         cmd = "mvn spring-boot:run" },
    @{ title = "Auth";         dir = "auth-service";        cmd = "mvn spring-boot:run" },
    @{ title = "Merchant";     dir = "merchant-service";    cmd = "mvn spring-boot:run" },
    @{ title = "Terminal";     dir = "terminal-service";    cmd = "mvn spring-boot:run" },
    @{ title = "Transaction";  dir = "transaction-service"; cmd = "mvn spring-boot:run" },
    @{ title = "Risk";         dir = "risk-service";        cmd = "mvn spring-boot:run" },
    @{ title = "Settlement";   dir = "settlement-service";  cmd = "mvn spring-boot:run" },
    @{ title = "Ops";          dir = "ops-service";         cmd = "mvn spring-boot:run" },
    @{ title = "Frontend";     dir = "frontend";            cmd = "npm run dev" }
)

$wtArgs = ""
$first = $true

foreach ($svc in $services) {
    $fullPath = Join-Path $root $svc.dir
    $fragment = "--title `"$($svc.title)`" cmd /k `"cd /d $fullPath && $($svc.cmd)`""

    if ($first) {
        $wtArgs += "new-tab $fragment"
        $first = $false
    } else {
        $wtArgs += " ; new-tab $fragment"
    }
}

Start-Process "wt" -ArgumentList $wtArgs