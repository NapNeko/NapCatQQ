[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$regPath = 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\QQ'
$uninstall = (Get-ItemProperty -Path $regPath -Name UninstallString -ErrorAction Stop).UninstallString
$uninstall = $uninstall.Trim('"')
$qqPath = Split-Path $uninstall -Parent

Write-Host "QQPath: $qqPath"
node.exe "tests/loadNapCat.cjs" "$qqPath"
