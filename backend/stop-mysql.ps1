$ErrorActionPreference = 'Stop'

$propertiesPath = Join-Path $PSScriptRoot 'src\main\resources\application.properties'
$passwordLine = Get-Content -LiteralPath $propertiesPath -Encoding utf8 |
    Where-Object { $_ -like 'spring.datasource.password=*' } |
    Select-Object -First 1

if (-not $passwordLine) {
    throw 'Senha do MySQL não encontrada em application.properties.'
}

$password = $passwordLine.Substring($passwordLine.IndexOf('=') + 1)
$adminPath = 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqladmin.exe'

if (-not (Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue)) {
    Write-Host 'MySQL já está desligado.'
    exit 0
}

try {
    $env:MYSQL_PWD = $password
    & $adminPath --protocol=TCP -h 127.0.0.1 -P 3306 -u root shutdown
    if ($LASTEXITCODE -ne 0) { throw 'O mysqladmin não conseguiu desligar o servidor.' }
    Write-Host 'MySQL desligado.'
} finally {
    Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
}
