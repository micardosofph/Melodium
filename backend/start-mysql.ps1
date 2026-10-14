$ErrorActionPreference = 'Stop'

$serverPath = 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe'
$configPath = Join-Path $env:LOCALAPPDATA 'MelodiumMySQL\my.ini'

if (-not (Test-Path -LiteralPath $serverPath)) {
    throw 'MySQL Server 8.4 não está instalado.'
}

if (-not (Test-Path -LiteralPath $configPath)) {
    throw 'A configuração local do MySQL para o Melodium não foi encontrada.'
}

if (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) {
    Write-Host 'MySQL já está ativo na porta 3306.'
    exit 0
}

Start-Process -FilePath $serverPath -ArgumentList @("--defaults-file=$configPath", '--console') -WindowStyle Hidden

for ($attempt = 0; $attempt -lt 30; $attempt++) {
    if (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue) {
        Write-Host 'MySQL iniciado na porta 3306.'
        exit 0
    }
    Start-Sleep -Milliseconds 500
}

throw 'O MySQL não abriu a porta 3306 dentro do tempo esperado.'
