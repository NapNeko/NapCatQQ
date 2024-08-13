@echo off
REM Check if the script is running as administrator
openfiles >nul 2>&1
if %errorlevel% neq 0 (
    REM If not, restart the script in administrator mode
    echo Requesting administrator privileges...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~f0 %*' -Verb RunAs"
    exit /b
)

cd /d %~dp0

set currentPath=%cd%
set currentPath=%currentPath:\=/%

REM Generate JavaScript code
set "jsCode=(async () =^>await import('file:///%currentPath%/napcat.mjs'))();"

REM Save JavaScript code to a file
echo %jsCode% > loadScript.js
echo JavaScript code has been generated and saved to loadScript.js

REM Set NAPCAT_PATH environment variable to the address of loadScript.js in the current directory
set NAPCAT_PATH=%cd%\loadScript.js

REM Get QQ path and cache it
:loop_read
for /f "tokens=2*" %%a in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\QQ" /v "UninstallString"') do (
    set "RetString=%%b"
)

set "pathWithoutUninstall=%RetString:Uninstall.exe=%"

SET QQPath=%pathWithoutUninstall%QQ.exe
echo %QQPath%>qq_path_cache.txt
echo QQ path %QQPath% has been cached to qq_path_cache.txt

REM Exit if QQ path is invalid
if not exist "%QQpath%" (
    echo provided QQ path is invalid: %QQpath%
    pause
    exit /b
)

REM Collect dbghelp.dll path and HASH information
set QQdir=%~dp0
set oldDllPath=%QQdir%dbghelp.dll
set newDllPath=%currentPath%\dbghelp.dll

for /f "tokens=*" %%A in ('certutil -hashfile "%oldDllPath%" MD5') do (
    if not defined oldDllHash set oldDllHash=%%A
)
for /f "tokens=*" %%A in ('certutil -hashfile "%newDllPath%" MD5') do (
    if not defined newDllHash set newDllHash=%%A
)

REM Compare the HASH of the old and new dbghelp.dll, and replace the old one if they are different
if "%oldDllHash%" neq "%newDllHash%" (
    tasklist /fi "imagename eq QQ.exe" 2>nul | find /i "QQ.exe" >nul
    if %errorlevel% equ 0 (
        REM If the file is in use, prompt the user to close QQ
        echo dbghelp.dll is in use, please close QQ first.
    ) else (
        copy /y "%newDllPath%" "%oldDllPath%"
        if %errorlevel% neq 0 (
            echo Copy dbghelp.dll failed, please check and try again.
            pause
            exit /b
        ) else (
            echo dbghelp.dll has been updated.
            echo Please run BootWay05_run.bat to start QQ.
            echo If you update QQ in the future, please run BootWay05_init.bat again.
            pause
            exit /b
        )
    )
)
