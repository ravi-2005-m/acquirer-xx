$root     = $PSScriptRoot
$mavenBin = "C:\The Maven 3.9.11\apache-maven-3.9.15\bin"
$javaHome = "C:\Program Files\Java\jdk-21"
$nodeBin  = "C:\Program Files\nodejs"
$tempDir  = [System.IO.Path]::GetTempPath()

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
$first  = $true

foreach ($svc in $services) {
    $fullPath = Join-Path $root $svc.dir
    $batFile  = Join-Path $tempDir "ax-start-$($svc.dir).bat"

    if ($svc.cmd -like "mvn*") {
        $batContent = "@echo off`r`nset JAVA_HOME=$javaHome`r`nset PATH=$mavenBin;$javaHome\bin;%PATH%`r`ncd /d `"$fullPath`"`r`n$($svc.cmd)`r`n"
    } else {
        $batContent = "@echo off`r`nset PATH=$nodeBin;%PATH%`r`ncd /d `"$fullPath`"`r`n$($svc.cmd)`r`n"
    }
    [System.IO.File]::WriteAllText($batFile, $batContent, [System.Text.Encoding]::ASCII)

    $fragment = "--title `"$($svc.title)`" cmd /k `"$batFile`""

    if ($first) {
        $wtArgs += "new-tab $fragment"
        $first = $false
    } else {
        $wtArgs += " ; new-tab $fragment"
    }
}

Start-Process "wt" -ArgumentList $wtArgs
