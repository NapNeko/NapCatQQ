@echo off
set /p QQPath=<qq_path_cache.txt
echo QQ path %QQPath% has been read from qq_path_cache.txt
echo If failed to start QQ, please try running this script in administrator mode.

set NAPCAT_PATH=%cd%\loadScript.js

REM Launch QQ.exe with params provided

"%QQPath%" --enable-logging  %*
