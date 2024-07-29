function Get-QQpath {
    try {
        $key = Get-ItemProperty -Path "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\QQ"
        $uninstallString = $key.UninstallString
        return [System.IO.Path]::GetDirectoryName($uninstallString) + "\QQ.exe"
    }
    catch {
        throw "get QQ path error: $_"
    }
}
function Select-QQPath {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.Application]::EnableVisualStyles()

    $dialogTitle = "Select QQ.exe"

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

# 获取当前目录路径
$currentPath = Get-Location

# 替换\为/
$currentPath = $currentPath -replace '\\', '/'

# 生成JavaScript代码
$jsCode = @"
(async () => {
    await import('file:///$currentPath/napcat.mjs');
})();
"@

# 将JavaScript代码保存到文件中
$jsFilePath = Join-Path $currentPath "loadScript.js"
$jsCode | Out-File -FilePath $jsFilePath -Encoding UTF8

Write-Output "JavaScript code has been generated and saved to $jsFilePath"
# 设置NAPCAT_PATH环境变量为 当前目录的loadScript.js地址
$env:NAPCAT_PATH = $jsFilePath

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

$commandInfo = Get-Command $QQpath -ErrorAction Stop
Start-Process powershell -ArgumentList "-noexit", "-noprofile", "-command &{& '$($commandInfo.Path)' --enable-logging $params}"