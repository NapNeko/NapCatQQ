<div align="center">
  <img src="https://socialify.git.ci/NapNeko/NapCatQQ/image?description=1&language=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2FNapNeko%2FNapCatQQ%2Fmain%2Flogo.png&name=1&stargazers=1&theme=Auto" alt="NapCatQQ" width="640" height="320" />
</div>

## 项目介绍

NapCatQQ 是基于NTQQ本体实现一套 Bot 框架。

名字寓意 瞌睡猫QQ (不准叫我 NCQQ！)，像睡着了一样在后台低占用运行的无需GUI界面的NTQQ。

## 使用教程

可前往 Release 页面下载最新版本，注意 v1.1.1 只能在 QQ 22741版本或以下版本使用，否则有可能出现崩溃情况。

如果你想体验最新的功能，可以到 [Actions](https://github.com/NapNeko/NapCatQQ/actions/workflows/build.yml) 下载开发版本，但不保证其稳定性

### Windows 启动

运行`powershell ./napcat.ps1`, 或者 `napcat.bat`，如果出现乱码，可以尝试运行`napcat-utf8.ps1` 或 `napcat-utf8.bat`

*如果出现 powershell 运行不了，可以尝试 `powershell.exe -ExecutionPolicy Bypass -File ".\napcat.ps1"`*

**推荐使用 bat 运行，powershell 会自身占用 20MB 左右的内存**

### Linux 启动

手动运行：运行`napcat.sh`

容器运行：使用[NapCatDocker](https://github.com/NapNeko/NapCat-Docker)

### 无需扫码快速登录

前提是已经登录过了，可以直接加上`-q <qq号>`参数，例如 `napcat.sh -q 1234567890`

### 详细教程

**首次使用** 请务必前往 [官方文档](https://napneko.github.io/) 查看使用文档与教程

## 项目声明

* 请不要在无关地方宣传NapCatQQ，本项目只是用于学习 node 相关知识，切勿用于违法用途

* NapCat 不会收集用户隐私信息，但是未来可能会为了更好的利于 NapCat 的优化会收集一些设备信息，如 cpu 架构，系统版本等
  
## 相关链接
[Telegram Link](https://t.me/+nLZEnpne-pQ1OWFl)

## 鸣谢名单

[OpenShamrock]()

[Lagrange]()

<!-- 
QQ群：545402644
-->
