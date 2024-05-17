function Get-QQpath {
    try {
        $key = Get-ItemProperty -Path "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\QQ"
        $uninstallString = $key.UninstallString
        throw "get QQ path error:"
        return [System.IO.Path]::GetDirectoryName($uninstallString) + "\QQ.exe"
    }
    catch {
        throw "get QQ path error: $_"
    }
}
function Select-QQPath {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.Application]::EnableVisualStyles()

    $dialogTitle = "Select an EXE File"
    
    $filePicker = New-Object System.Windows.Forms.OpenFileDialog
    $filePicker.Title = $dialogTitle
    $filePicker.Filter = "Executable Files (*.exe)|*.exe|All Files (*.*)|*.*"
    $filePicker.FilterIndex = 1
    $null = $filePicker.ShowDialog()
    if (-not ($filePicker.FileName)) {
        throw "User did not select an .exe file."
    }
    return $filePicker.FileName
}

$params = $args -join " "
Try {
    $QQpath = Get-QQpath
}
Catch {
    $QQpath = Select-QQPath
}

if (!(Test-Path $QQpath)) {
    throw "provided QQ path is invalid: $QQpath"
}

$Bootfile = Join-Path $PSScriptRoot "napcat.cjs"
$env:ELECTRON_RUN_AS_NODE = 1
$commandInfo = Get-Command $QQpath -ErrorAction Stop
Start-Process powershell -ArgumentList "-noexit", "-noprofile", "-command &{& chcp 65001;& '$($commandInfo.Path)' $Bootfile $params}"