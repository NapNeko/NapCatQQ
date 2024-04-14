function Get-QQpath {
    try {
        $key = Get-ItemProperty -Path "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\QQ"
        $uninstallString = $key.UninstallString
        return [System.IO.Path]::GetDirectoryName($uninstallString) + "\QQ.exe"
    }
    catch {
        return "D:\QQ.exe"
    }
}
$params = $args -join " "
$QQpath = Get-QQpath
$Bootfile = Join-Path $PSScriptRoot "napcat.cjs"
$env:ELECTRON_RUN_AS_NODE = 1
Start-Process powershell -ArgumentList "-noexit", "-noprofile", "-command &{& chcp 65001;& '$QQpath' $Bootfile $params}"
