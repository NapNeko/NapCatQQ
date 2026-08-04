@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
echo ========================================================
echo   NapCat + Java 插件桥接器 一键打包脚本
echo ========================================================
echo.

set ROOT=%~dp0
cd /d "%ROOT%"

:: ---------- 环境检查 ----------
where node >nul 2>nul
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)
where pnpm >nul 2>nul
if errorlevel 1 (
    echo [提示] 未检测到 pnpm，使用 npm i -g pnpm 安装
    call npm i -g pnpm
)
where mvn >nul 2>nul
if errorlevel 1 (
    echo [警告] 未检测到 Maven (mvn)，Java SDK 将不打包（只打包 Node 插件）
    echo        如需要 Java 插件，请安装 JDK 11+ 和 Maven 后重新运行
    set NO_MAVEN=1
) else (
    set NO_MAVEN=0
)

:: ---------- 安装依赖 ----------
echo.
echo [1/5] 安装 Node 依赖...
if not exist node_modules (
    call pnpm install
    if errorlevel 1 (
        echo [错误] pnpm install 失败
        pause
        exit /b 1
    )
) else (
    echo   跳过（已存在 node_modules）
)

:: ---------- 构建 Java SDK ----------
echo.
if "%NO_MAVEN%"=="0" (
    echo [2/5] 构建 Java SDK （NapCatSDK）...
    echo        Profile: bridge（构建运行时 fat-jar）+ dev（跳过 GPG 签名）
    pushd NapCatSDK
    call mvn -q -Pdev -Pbridge clean package -DskipTests
    if errorlevel 1 (
        echo [错误] Maven 构建失败
        popd
        pause
        exit /b 1
    )
    popd
    if exist "NapCatSDK\target\napcat-jni-bridge.jar" (
        copy /y "NapCatSDK\target\napcat-jni-bridge.jar" "packages\napcat-JNI\napcat-jni-bridge.jar" >nul
        echo   JAR 已生成并拷贝到 packages\napcat-JNI\
    ) else (
        echo [警告] JAR 未生成，请检查 Maven 构建日志
    )
) else (
    echo [2/5] 跳过 Java SDK 构建（未检测到 Maven）
)

:: ---------- 构建插件 ----------
echo.
echo [3/5] 构建 WebUI 前端...
call pnpm run build:webui
if errorlevel 1 (
    echo [警告] build:webui 失败，继续打包...
)

echo.
echo [4/5] 构建内置插件 & JNI 插件...
call pnpm run build:plugin-builtin
call pnpm run build:plugin-jni
if errorlevel 1 (
    echo [错误] 插件构建失败
    pause
    exit /b 1
)

:: ---------- 构建 Framework（主程序） ----------
echo.
echo [5/5] 构建 NapCat Framework （主程序）...
call pnpm run build:framework
if errorlevel 1 (
    echo [错误] Framework 构建失败
    pause
    exit /b 1
)

echo.
echo ========================================================
echo   打包完成！产物位于: packages\napcat-framework\dist\
echo ========================================================
echo.
echo   目录结构：
echo     dist\
echo      +-- napcat.mjs            主程序入口
echo      +-- napiloader.dll / napimain.exe   QQNT 注入器
echo      +-- native\              原生依赖
echo      +-- static\              WebUI 前端
echo      +-- config\              默认配置文件
echo      +-- plugins\
echo           +-- napcat-plugin-builtin\    内置插件
echo           +-- napcat-plugin-jni\        Java 桥接插件（包含 JAR）
echo.
pause
