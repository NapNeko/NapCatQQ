@echo off
setlocal DisableDelayedExpansion
cd /d "%~dp0" || exit /b 1
chcp 65001 >nul
set "NAPCAT_PATCH_PACKAGE=%cd%\qqnt.json"
set "NAPCAT_LOAD_PATH=%cd%\loadNapCat.js"
set "NAPCAT_INJECT_PATH=%cd%\NapCatWinBootHook.dll"
set "NAPCAT_LAUNCHER_PATH=%cd%\NapCatWinBootMain.exe"
set "NAPCAT_MAIN_PATH=%cd%\napcat.mjs"
set "RetString="
for /f "tokens=2*" %%a in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\QQ" /v "UninstallString"') do (
     set "RetString=%%~b"
    goto :napcat_boot
)
echo QQ installation was not found in the registry.
pause
exit /b 1

:napcat_boot
for %%a in ("%RetString%") do (
    set "pathWithoutUninstall=%%~dpa"
)

set "QQPath=%pathWithoutUninstall%QQ.exe"

if not exist "%QQpath%" (
    echo provided QQ path is invalid
    pause
    exit /b 1
)

"%NAPCAT_LAUNCHER_PATH%" "%QQPath%" "%NAPCAT_INJECT_PATH%" %*
set "napcat_exit_code=%ERRORLEVEL%"
pause
exit /b %napcat_exit_code%
