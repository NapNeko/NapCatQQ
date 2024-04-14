@echo off
setlocal enabledelayedexpansion
chcp 65001
:loop_read
for /f "tokens=3" %%a in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\QQ" /v "UninstallString"') do (
    set "RetString=%%a"
    goto :napcat_boot
)

goto :loop_read

:napcat_boot
for %%a in ("!RetString!") do (
    set "pathWithoutUninstall=%%~dpa"
    set "fileName=%%~na"
    set "extension=%%~xa"
)

set "QQPath=!pathWithoutUninstall!QQ.exe"
set ELECTRON_RUN_AS_NODE=1
echo !QQPath!
!QQPath! ./napcat.cjs