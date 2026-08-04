#!/usr/bin/env bash
# NapCat + Java 插件桥接器 一键打包脚本（bash 版）
set -e

echo "========================================================"
echo "  NapCat + Java 插件桥接器 一键打包脚本"
echo "========================================================"
echo

# 切换到脚本所在目录（仓库根）
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# ---------- 环境检查 ----------
if ! command -v node >/dev/null 2>&1; then
    echo "[错误] 未检测到 Node.js，请先安装 Node.js 18+"
    exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
    echo "[提示] 未检测到 pnpm，使用 npm i -g pnpm 安装"
    npm i -g pnpm
fi

NO_MAVEN=0
if ! command -v mvn >/dev/null 2>&1; then
    echo "[警告] 未检测到 Maven (mvn)，Java SDK 将不打包（只打包 Node 插件）"
    echo "       如需要 Java 插件，请安装 JDK 11+ 和 Maven 后重新运行"
    NO_MAVEN=1
fi

# ---------- 安装依赖 ----------
echo
echo "[1/5] 安装 Node 依赖..."
if [ ! -d node_modules ]; then
    pnpm install
else
    echo "  跳过（已存在 node_modules）"
fi

# ---------- 构建 Java SDK ----------
echo
if [ "$NO_MAVEN" = "0" ]; then
    echo "[2/5] 构建 Java SDK (NapCatSDK)..."
    echo "        Profile: bridge（构建运行时 fat-jar）+ dev（跳过 GPG 签名）"
    pushd NapCatSDK >/dev/null
    mvn -q -Pdev -Pbridge clean package -DskipTests
    popd >/dev/null
    if [ -f "NapCatSDK/target/napcat-jni-bridge.jar" ]; then
        cp -f NapCatSDK/target/napcat-jni-bridge.jar packages/napcat-JNI/napcat-jni-bridge.jar
        echo "  JAR 已生成并拷贝到 packages/napcat-JNI/"
    else
        echo "[警告] JAR 未生成，请检查 Maven 构建日志"
    fi
else
    echo "[2/5] 跳过 Java SDK 构建（未检测到 Maven）"
fi

# ---------- 构建插件 ----------
echo
echo "[3/5] 构建 WebUI 前端..."
pnpm run build:webui || echo "[警告] build:webui 失败，继续打包..."

echo
echo "[4/5] 构建内置插件 & JNI 插件..."
pnpm run build:plugin-builtin
pnpm run build:plugin-jni

# ---------- 构建 Framework（主程序） ----------
echo
echo "[5/5] 构建 NapCat Framework (主程序)..."
pnpm run build:framework

echo
echo "========================================================"
echo "  打包完成！产物位于: packages/napcat-framework/dist/"
echo "========================================================"
echo
echo "  目录结构："
echo "    dist/"
echo "     +-- napcat.mjs            主程序入口"
echo "     +-- napiloader.dll / napimain.exe   QQNT 注入器"
echo "     +-- native/               原生依赖"
echo "     +-- static/               WebUI 前端"
echo "     +-- config/               默认配置文件"
echo "     +-- plugins/"
echo "          +-- napcat-plugin-builtin/    内置插件"
echo "          +-- napcat-plugin-jni/        Java 桥接插件（含 JAR）"
