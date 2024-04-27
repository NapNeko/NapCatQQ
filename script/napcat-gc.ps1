function Get-QQpath {
    try {
        $key = Get-ItemProperty -Path "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\QQ"
        $uninstallString = $key.UninstallString
        return [System.IO.Path]::GetDirectoryName($uninstallString) + "\QQ.exe"
    }
    catch {
        throw "Error getting UninstallString: $_"
    }
}
$params = $args -join " "
$QQpath = Get-QQpath
$Bootfile = Join-Path (Get-Location) "\dist\inject.cjs"
$env:ELECTRON_RUN_AS_NODE = 1
Start-Process powershell -ArgumentList "-noexit", "-noprofile", "-command &{& '$QQpath' --expose-gc $Bootfile $params}"
