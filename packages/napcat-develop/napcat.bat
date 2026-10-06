@echo off
setlocal
cd /d "%~dp0" || exit /b 1
"%~dp0node.exe" "%~dp0index.js" %*
exit /b %errorlevel%
