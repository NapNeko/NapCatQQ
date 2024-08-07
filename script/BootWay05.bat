@echo off
REM 检查当前会话是否具有管理员权限
openfiles >nul 2>&1
if %errorlevel% neq 0 (
    REM 如果不是管理员，则重新启动脚本以管理员模式运行
    echo 请求管理员权限...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~f0 %*' -Verb RunAs"
    exit /b
)

REM 设置当前工作目录
cd /d %~dp0

REM 获取当前目录路径
set currentPath=%cd%
set currentPath=%currentPath:\=/%

REM 生成JavaScript代码
set "jsCode=(async () =^>await import('file:///%currentPath%/napcat.mjs'))();"

REM 将JavaScript代码保存到文件中
echo %jsCode% > loadScript.js
echo JavaScript code has been generated and saved to loadScript.js

REM 设置NAPCAT_PATH环境变量为 当前目录的loadScript.js地址
set NAPCAT_PATH=%cd%\loadScript.js

REM 获取QQ路径


:loop_read
for /f "tokens=2*" %%a in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\QQ" /v "UninstallString"') do (
    set RetString=%%b
    goto :napcat_boot
)

:napcat_boot
for %%a in (%RetString%) do (
    set "pathWithoutUninstall=%%~dpa"
)

SET QQPath=%pathWithoutUninstall%QQ.exe

REM 拿不到QQ路径则退出
if not exist "%QQpath%" (
    echo provided QQ path is invalid: %QQpath%
    pause
    exit /b
)

REM 收集dbghelp.dll路径和HASH信息
set QQdir=%~dp0
set oldDllPath=%QQdir%dbghelp.dll
set newDllPath=%currentPath%\dbghelp.dll

for /f "tokens=*" %%A in ('certutil -hashfile "%oldDllPath%" MD5') do (
    if not defined oldDllHash set oldDllHash=%%A
)
for /f "tokens=*" %%A in ('certutil -hashfile "%newDllPath%" MD5') do (
    if not defined newDllHash set newDllHash=%%A
)

REM 如果文件一致则跳过
if "%oldDllHash%" neq "%newDllHash%" (
    tasklist /fi "imagename eq QQ.exe" 2>nul | find /i "QQ.exe" >nul
    if %errorlevel% equ 0 (
        REM 文件占用则退出
        echo dbghelp.dll is in use, cannot continue.
    ) else (
        REM 文件未占用则尝试覆盖
        copy /y "%newDllPath%" "%oldDllPath%"
        if %errorlevel% neq 0 (
            echo Failed to copy dbghelp.dll
            pause
            exit /b
        ) else (
            echo dbghelp.dll has been copied to %QQdir%
        )
    )
)

REM 带参数启动QQ
REM 判断wt是否存在，存在则通过wt启动，不存在则通过cmd启动
REM %QQPath% --enable-logging  %*
where wt >nul 2>nul
if %errorlevel% equ 0 (
    wt "cmd" /c "%QQPath%" --enable-logging  %* 
) else (
    "%QQPath%" --enable-logging  %*
)
