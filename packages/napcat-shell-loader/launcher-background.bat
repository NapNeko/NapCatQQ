@echo off
chcp 65001
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Administrator mode detected.
) else (
    echo Please run this script in administrator mode.
    powershell -Command "Start-Process 'wt.exe' -ArgumentList 'cmd /c cd /d \"%cd%\" && \"%~f0\" %1' -Verb runAs"
    exit
)

set NAPCAT_PATCH_PACKAGE=%cd%\qqnt.json
set NAPCAT_LOAD_PATH=%cd%\loadNapCat.js
set NAPCAT_INJECT_PATH=%cd%\NapCatWinBootHook.dll
set NAPCAT_LAUNCHER_PATH=%cd%\NapCatWinBootMain.exe
set NAPCAT_MAIN_PATH=%cd%\napcat.mjs
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

if not exist "%QQPath%" (
    echo provided QQ path is invalid
    pause
    exit /b
)

set NAPCAT_MAIN_PATH=%NAPCAT_MAIN_PATH:\=/%
echo (async () =^> {await import("file:///%NAPCAT_MAIN_PATH%")})() > "%NAPCAT_LOAD_PATH%"

@REM 本行以上部分与 launcher.bat 相同，修改以下部分，实现后台启动

@REM 创建 VBS 临时脚本
set "VBS=%temp%\napcat_start.vbs"
@REM 后台运行原启动命令
@REM 首次登录时的二维码和 WebUI token 就去查 log 好了
echo Set WshShell = CreateObject("WScript.Shell") > "%VBS%"
echo WshShell.Run """%NAPCAT_LAUNCHER_PATH%"" ""%QQPath%"" ""%NAPCAT_INJECT_PATH%"" %1", 0, False >> "%VBS%"

@REM 执行 VBS 脚本
cscript //nologo "%VBS%"

@REM 删除临时文件并退出
del "%VBS%" >nul 2>&1
exit /b