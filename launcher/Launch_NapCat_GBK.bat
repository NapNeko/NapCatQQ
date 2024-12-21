@ECHO OFF&PUSHD %~DP0&TITLE Requesting UAC Privileges ...&CHCP 936
SET "PARAMS=%*"
if not defined PARAMS (
    reg query "HKU\S-1-5-19">NUL 2>&1||powershell -Command "Start-Process '%~sdpnx0' -Verb RunAs"&&EXIT
) else (
    reg query "HKU\S-1-5-19">NUL 2>&1||powershell -Command "Start-Process '%~sdpnx0' -ArgumentList '%*' -Verb RunAs"&&EXIT
)
ECHO.
:: 出错了不关本喵事, 拟自己修 qwq (散装bat, 能动就行)
SET WORK_DIR=%~dp0
setlocal
TITLE Checking...
reg query "HKLM\Hardware\Description\System\CentralProcessor\0" /v "Identifier" | find /i "x86" >nul 2>&1 && (set arch=x86) || (set arch=x64)
:: 查询注册表获取当前系统版本号
for /f "tokens=3" %%i in ('reg query "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion" /v CurrentBuild') do set build=%%i

:: 判断系统版本号是否大于等于7601 [GBK的话,那想必系统比较老,只要是Win7 SP1以上的应该都能用 !!32位请自行测试!!]
if %build% GEQ 7601 (
    goto launchnapcat
) else (
    goto unsupportedos
)

:launchnapcat
echo.当前系统版本符合要求^: ^[%BUILD%_%ARCH%^]
echo.当前工作目录为: %WORK_DIR%
echo.

SET NAPCAT_LAUNCHER_PATH=%WORK_DIR%NapCatWinBootMain.exe
SET NAPCAT_PATCH_PACKAGE=%WORK_DIR%qqnt.json
SET NAPCAT_MAIN_PATH=%WORK_DIR%napcat.mjs
SET NAPCAT_LOAD_PATH=%WORK_DIR%loadNapCat.js
SET NAPCAT_INJECT_PATH=%WORK_DIR%NapCatWinBootHook.dll

:: 通过注册表里的卸载项获得QQ所在路径
for /f "tokens=2*" %%a in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\QQ" /v "UninstallString"') do (
set RetString=%%b
)
for %%a in ("%RetString%") do (
set "pathWithoutUninstall=%%~dpa"
)
SET QQ_PATH=%pathWithoutUninstall%QQ.exe

echo.当前环境变量已经设置为:
set NAPCAT
set QQ

goto checkpass
ECHO. && ECHO 文件检查^:
if exist "%NAPCAT_LAUNCHER_PATH%" (
    echo    NAPCAT_LAUNCHER_PATH         ...^[PASS^]
    ) else (
    goto filenoexist
    )
if exist "%NAPCAT_PATCH_PACKAGE%" (
    echo    NAPCAT_PATCH_PACKAGE         ...^[PASS^]
    ) else (
    goto filenoexist
    )
if exist "%NAPCAT_MAIN_PATH%" (
    echo    NAPCAT_MAIN_PATH             ...^[PASS^]
    ) else (
    goto filenoexist
    )
if exist "%NAPCAT_INJECT_PATH%" (
    echo    NAPCAT_INJECT_PATH           ...^[PASS^]
    ) else (
    goto filenoexist
    )
if exist "%QQ_PATH%" (
    echo    QQ_PATH                      ...^[PASS^]
    ) else (
    color 4F
    echo.哈喵^,QQ去哪了捏...
    goto end
    )

:checkpass
TITLE NapCat
ECHO. && ECHO Command: "%NAPCAT_LAUNCHER_PATH%" "%QQ_PATH%" "%NAPCAT_INJECT_PATH%" %*

:: 替换反斜杠为正斜杠并输出到NAPCAT_LOAD_PATH
set "NAPCAT_MAIN_PATH_POSIX=%NAPCAT_MAIN_PATH:\=/%"
echo (async () =^> {await import("file:///%NAPCAT_MAIN_PATH_POSIX%")})() > "%NAPCAT_LOAD_PATH%"

:: 检查 %* 是否为空，如果不为空，直接设置环境变量并跳转到 ncloop
if "%~1" NEQ "" (
    if "%~2" NEQ "" (
        COLOR 1F
        ECHO. 如果需要快速登录^,正确的做法是 ^"启动脚本.bat^" -q^<QQ号^>
        ECHO. 例如^: ^"NapCat_Win10.bat ^-q10000^"
        ECHO. 请按任意键继续...
        PAUSE > NUL
        COLOR 07
    )
    goto ncloop
) else (
    COLOR 2F
    ECHO. && ECHO 请按任意键启动...
    PAUSE > NUL
    COLOR 07
)

:ncloop
ECHO.
"%NAPCAT_LAUNCHER_PATH%" "%QQ_PATH%" "%NAPCAT_INJECT_PATH%" %*
ECHO  警告: LOADER进程已结束, 可能需要检查控制台输出...
ECHO  按任意键退出
PAUSE > NUL
goto end

:unsupportedos
:: 设置CMD窗口的颜色为红底白字
color 4F 
:: 设置CMD窗口尺寸为5行23列
mode con: cols=56 lines=5
TITLE Error
ECHO. && ECHO. && ECHO Not supported by current system version. ^[%BUILD%_%ARCH%^]
goto end

:filenoexist
TITLE FILE_CHECK_FAILED
color 4F
mode con: cols=56 lines=5
CLS && ECHO. && ECHO. && ECHO 缺失 NapCat 启动相关文件... 请检查一下是不是解压漏了

:end
endlocal
PAUSE > NUL
EXIT 1