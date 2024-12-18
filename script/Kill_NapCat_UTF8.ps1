# BAT 里头的wmic写到蛋疼, 没写明白,让Copilot写了一份,能动就行 qwq
# 获取 NapCat 主进程的 PID
$mainProcess = Get-Process | Where-Object { $_.MainWindowTitle -eq "Administrator:  NapCat" }
if (-not $mainProcess) {
    Write-Output "未找到 NapCat 主进程"
    exit 1
}

$mainPID = $mainProcess.Id
Write-Output "找到 NapCat 主进程，PID: $mainPID"

# 定义函数来查找子进程
function Get-ChildProcesses($parentPID) {
    $childProcesses = Get-WmiObject Win32_Process | Where-Object { $_.ParentProcessId -eq $parentPID }
    return $childProcesses
}

# 查找 NapCatWinBootMain.exe 的子进程
$napCatChild = Get-ChildProcesses -parentPID $mainPID | Where-Object { $_.Name -eq "NapCatWinBootMain.exe" }
if ($napCatChild) {
    $napCatChildPID = $napCatChild.ProcessId
    Write-Output "找到 NapCatWinBootMain.exe 进程，PID: $napCatChildPID"

    # 查找 qq.exe 的子进程
    $qqProcess = Get-ChildProcesses -parentPID $napCatChildPID | Where-Object { $_.Name -eq "qq.exe" }
    if ($qqProcess) {
        $qqPID = $qqProcess.ProcessId
        Write-Output "找到 QQ 进程，PID: $qqPID"
        
        # 结束 qq.exe
        Stop-Process -Id $qqPID -Force
        Write-Output "已结束 QQ 进程"
    } else {
        # 如果没有找到 qq.exe，则结束 NapCatWinBootMain.exe
        Stop-Process -Id $napCatChildPID -Force
        Write-Output "未找到 QQ 进程，已结束 NapCatWinBootMain.exe"
    }
} else {
    Write-Output "未找到 NapCatWinBootMain.exe 进程"
}

# 最后结束 NapCat 主进程
Stop-Process -Id $mainPID -Force
Write-Output "已结束 NapCat 主进程"
