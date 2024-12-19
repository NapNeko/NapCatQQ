@echo off
for /f "tokens=2 delims=:" %%a in ('chcp') do set codePage=%%a

if "%codePage%" neq " 936" (
    call Kill_NapCat_UTF8.bat
) else (
    call Kill_NapCat_GBK.bat
)