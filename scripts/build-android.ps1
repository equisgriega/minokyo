# Google Play için imzalı AAB üretir.
# Kullanım (store klasöründe):
#   powershell -ExecutionPolicy Bypass -File scripts\build-android.ps1 -VersionCode 2 -VersionName 1.0.1
#
# Her Play yüklemesinde VersionCode bir öncekinden BÜYÜK olmalı.
# Proje yolunda Türkçe karakter (Masaüstü) olduğu için Android derleyicisi geçici M: sürücüsünden çalıştırılır.
param(
  [Parameter(Mandatory = $true)][int]$VersionCode,
  [Parameter(Mandatory = $true)][string]$VersionName
)
$ErrorActionPreference = "Stop"

$Project = Split-Path -Parent $PSScriptRoot
$Jdk = Get-ChildItem "C:\Program Files\Microsoft" -Directory -Filter "jdk-21*" | Select-Object -First 1
if (-not $Jdk) { throw "JDK 21 bulunamadı. Kur: winget install Microsoft.OpenJDK.21" }
if (-not (Test-Path "$Project\android\keystore.properties")) { throw "android\keystore.properties yok (imza anahtarı)." }

$env:JAVA_HOME = $Jdk.FullName
$Drive = "M:"
if (Test-Path "$Drive\") { subst $Drive /d | Out-Null }
subst $Drive $Project
try {
  Push-Location "$Drive\"
  Write-Host "→ Capacitor eşitleniyor..."
  npx cap sync android
  Push-Location "$Drive\android"
  Write-Host "→ AAB derleniyor (sürüm $VersionName / kod $VersionCode)..."
  .\gradlew.bat --no-daemon bundleRelease "-PappVersionCode=$VersionCode" "-PappVersionName=$VersionName"
  if ($LASTEXITCODE -ne 0) { throw "Gradle derlemesi başarısız." }
  Pop-Location
  $Out = "$Project\play-store\release"
  New-Item -ItemType Directory -Force $Out | Out-Null
  $Dest = "$Out\minokyo-$VersionName-$VersionCode.aab"
  Copy-Item "$Project\android\app\build\outputs\bundle\release\app-release.aab" $Dest -Force
  Write-Host "✓ Hazır: $Dest"
} finally {
  Pop-Location -ErrorAction SilentlyContinue
  Set-Location $Project
  subst $Drive /d | Out-Null
}
