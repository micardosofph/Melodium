param(
  [string]$KeystorePath = (Join-Path ([Environment]::GetFolderPath("MyDocuments")) "Melodium-secrets\melodium-release.jks"),
  [string]$KeyAlias = "melodium-release"
)

$ErrorActionPreference = "Stop"

function ConvertFrom-SecureValue {
  param([Security.SecureString]$Value)

  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$credentialsDirectory = Join-Path $projectRoot "credentials\android"
$projectKeystore = Join-Path $credentialsDirectory "melodium-release.jks"
$credentialsFile = Join-Path $projectRoot "credentials.json"

if (-not (Test-Path -LiteralPath $KeystorePath -PathType Leaf)) {
  throw "Arquivo de assinatura nao encontrado: $KeystorePath"
}

New-Item -ItemType Directory -Path $credentialsDirectory -Force | Out-Null

if (Test-Path -LiteralPath $projectKeystore -PathType Leaf) {
  $sourceHash = (Get-FileHash -LiteralPath $KeystorePath -Algorithm SHA256).Hash
  $destinationHash = (Get-FileHash -LiteralPath $projectKeystore -Algorithm SHA256).Hash
  if ($sourceHash -ne $destinationHash) {
    throw "Ja existe outra chave em $projectKeystore. Ela nao foi sobrescrita."
  }
}
else {
  Copy-Item -LiteralPath $KeystorePath -Destination $projectKeystore
}

$storePasswordSecure = Read-Host "Digite a senha do arquivo melodium-release.jks" -AsSecureString
$storePassword = ConvertFrom-SecureValue $storePasswordSecure
if ([string]::IsNullOrWhiteSpace($storePassword)) {
  throw "A senha do arquivo nao pode ficar vazia."
}

$samePasswordAnswer = Read-Host "A senha da chave e igual a senha do arquivo? [S/n]"
if ([string]::IsNullOrWhiteSpace($samePasswordAnswer) -or $samePasswordAnswer -match "^[sS]") {
  $keyPassword = $storePassword
}
else {
  $keyPasswordSecure = Read-Host "Digite a senha da chave" -AsSecureString
  $keyPassword = ConvertFrom-SecureValue $keyPasswordSecure
  if ([string]::IsNullOrWhiteSpace($keyPassword)) {
    throw "A senha da chave nao pode ficar vazia."
  }
}

$previousKeytoolPassword = $env:MELODIUM_KEYTOOL_STORE_PASSWORD
$env:MELODIUM_KEYTOOL_STORE_PASSWORD = $storePassword

try {
  $previousErrorActionPreference = $ErrorActionPreference
  try {
    # No Windows PowerShell 5, mensagens do stderr de programas nativos viram
    # NativeCommandError quando ErrorActionPreference esta como Stop.
    $ErrorActionPreference = "Continue"
    & keytool -list -keystore $projectKeystore -storepass:env MELODIUM_KEYTOOL_STORE_PASSWORD -alias $KeyAlias 1>$null 2>$null
    $keytoolExitCode = $LASTEXITCODE
  }
  finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }

  if ($keytoolExitCode -ne 0) {
    throw "Nao foi possivel abrir a chave. Confira a senha e o alias '$KeyAlias'."
  }

  $credentials = [ordered]@{
    android = [ordered]@{
      keystore = [ordered]@{
        keystorePath = "credentials/android/melodium-release.jks"
        keystorePassword = $storePassword
        keyAlias = $KeyAlias
        keyPassword = $keyPassword
      }
    }
  }

  $json = $credentials | ConvertTo-Json -Depth 4
  [IO.File]::WriteAllText($credentialsFile, $json + [Environment]::NewLine, [Text.UTF8Encoding]::new($false))
}
finally {
  if ($null -eq $previousKeytoolPassword) {
    Remove-Item Env:MELODIUM_KEYTOOL_STORE_PASSWORD -ErrorAction SilentlyContinue
  }
  else {
    $env:MELODIUM_KEYTOOL_STORE_PASSWORD = $previousKeytoolPassword
  }

  $storePassword = $null
  $keyPassword = $null
}

Write-Host ""
Write-Host "Assinatura Android configurada com sucesso." -ForegroundColor Green
Write-Host "Chave local: credentials\android\melodium-release.jks"
Write-Host "Credenciais locais: credentials.json"
Write-Host "Esses dois arquivos estao protegidos pelo .gitignore."
