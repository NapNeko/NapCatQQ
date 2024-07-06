@echo off
chcp 65001
:: 检查是否有管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo 请求管理员权限...
    powershell -Command "Start-Process '%~f0' -Verb runAs"
    exit /b
)
:: 如果有管理员权限，继续执行
setlocal enabledelayedexpansion
:loop_read
for /f "tokens=2*" %%a in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\QQ" /v "UninstallString"') do (
    set "RetString=%%b"
    goto :napcat_boot
)

:napcat_boot
for %%a in ("!RetString!") do (
    set "pathWithoutUninstall=%%~dpa"
)

set "QQPath=!pathWithoutUninstall!QQ.exe"

echo !QQPath!
"!QQPath!" --enable-logging  %*

pause
