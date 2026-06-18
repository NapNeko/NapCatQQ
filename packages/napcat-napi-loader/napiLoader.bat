@echo off
chcp 65001
set NAPCAT_INJECT_PATH=%cd%\napiloader.dll
set NAPCAT_LAUNCHER_PATH=%cd%\napimain.exe
set NAPCAT_MAIN_PATH=%cd%\nativeLoader.cjs
:loop_read
for /f "tokens=2*" %%a in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\QQ" /v "UninstallString"') do (
     set "RetString=%%~b"
    goto :napcat_boot
)

:napcat_boot
for %%a in ("%RetString%") do (
    set "pathWithoutUninstall=%%~dpa"
)

set "QQPath=%pathWithoutUninstall%QQ.exe"

if not exist "%QQpath%" (
    echo provided QQ path is invalid
    pause
    exit /b
)

set NAPCAT_MAIN_PATH=%NAPCAT_MAIN_PATH:\=/%

start "" "%NAPCAT_LAUNCHER_PATH%" "%QQPath%" "%NAPCAT_INJECT_PATH%" "%NAPCAT_MAIN_PATH%"