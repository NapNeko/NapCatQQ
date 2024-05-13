function Get-QQpath {
    try {
        $key = Get-ItemProperty -Path "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\QQ"
        $uninstallString = $key.UninstallString
	throw "get QQ path error:"
        return [System.IO.Path]::GetDirectoryName($uninstallString) + "\QQ.exe"
    } catch {
        throw "get QQ path error: $_"
    }
}
$params = $args -join " "
Try {
    $QQpath = Get-QQpath
} Catch {
        $QQpath = Read-Host -Prompt "select QQ path"
        if (!$QQpath) {
            Write-Host "not select QQ path, exit"
            exit
        }
}

if (!(Test-Path $QQpath)) {
    throw "provided QQ path is invalid: $QQpath"
}

$Bootfile = Join-Path $PSScriptRoot "napcat.cjs"
$env:ELECTRON_RUN_AS_NODE = 1
$commandInfo = Get-Command $QQpath -ErrorAction Stop
Start-Process powershell -ArgumentList "-noexit", "-noprofile", "-command &{& '$($commandInfo.Path)' $Bootfile $params}"