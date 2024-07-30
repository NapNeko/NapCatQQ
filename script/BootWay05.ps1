# 检查当前会话是否具有管理员权限
function Test-Administrator {
    $user = [Security.Principal.WindowsIdentity]::GetCurrent()
    (New-Object Security.Principal.WindowsPrincipal $user).IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

if (-not (Test-Administrator)) {
    # 如果不是管理员，则重新启动脚本以管理员模式运行
    $scriptPath = $myInvocation.MyCommand.Path
    if (-not $scriptPath) {
        $scriptPath = $PSCommandPath
    }
    $newProcess = New-Object System.Diagnostics.ProcessStartInfo "powershell";
    $newProcess.Arguments = "-File `"$scriptPath`" $args"
    $newProcess.Verb = "runas";
    [System.Diagnostics.Process]::Start($newProcess);
    exit
}

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

# 设置当前工作目录
$scriptDirectory = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
Set-Location $scriptDirectory

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
# 拿不到QQ路径则退出
if (!(Test-Path $QQpath)) {
    Write-Output "provided QQ path is invalid: $QQpath"
    Read-Host "Press any key to continue..."
    exit
}

$commandInfo = Get-Command $QQpath -ErrorAction Stop

# 收集dbghelp.dll路径和HASH信息
$QQpath = Split-Path $QQpath
$oldDllPath = Join-Path $QQpath "dbghelp.dll"
$oldDllHash = Get-FileHash $oldDllPath -Algorithm MD5
$newDllPath = Join-Path $currentPath "dbghelp.dll"
$newDllHash = Get-FileHash $newDllPath -Algorithm MD5
# 如果文件一致则跳过
if ($oldDllHash.Hash -ne $newDllHash.Hash) {
    $processes = Get-Process -Name QQ -ErrorAction SilentlyContinue
    if ($processes) {
        # 文件占用则退出
        Write-Output "dbghelp.dll is in use by the following processes:"
        $processes | ForEach-Object { Write-Output "$($_.Id) $($_.Name) $($_.Path)" }
        Write-Output "dbghelp.dll is in use, cannot continue."
        Read-Host "Press any key to continue..."
        exit
    } else {
        # 文件未占用则尝试覆盖
        try {
            Copy-Item -Path "$newDllPath" -Destination "$oldDllPath" -Force
            Write-Output "dbghelp.dll has been copied to $QQpath"
        } catch {
            Write-Output "Failed to copy dbghelp.dll: $_"
            Read-Host "Press any key to continue..."
            exit
        }
    }
}

# 带参数启动QQ
try {
    Start-Process powershell -ArgumentList '-noexit', '-noprofile', "-command &{& chcp 65001;& '$($commandInfo.Path)' --enable-logging $params}" -NoNewWindow -ErrorAction Stop
} catch {
    Write-Output "Failed to start process as administrator: $_"
    Read-Host "Press any key to continue..."
}