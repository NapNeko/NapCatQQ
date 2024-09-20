<div align="center">
  <img src="https://socialify.git.ci/NapNeko/NapCatQQ/image?description=1&language=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2FNapNeko%2FNapCatQQ%2Fmain%2Flogo.png&name=1&stargazers=1&theme=Auto" alt="NapCatQQ" width="640" height="320" />
</div>

---

## Roadmap: Migrate to Laana

目前的 OneBot 11 协议存在众多难以克服的深层次问题，并且，该协议的社区及其设计者对协议端开发者的态度**一言难尽**。鉴于此，我们正在计划一个新的协议 [Laana](https://github.com/LaanaProto/Laana)，它基于 Protobuf，将会是一个更加高效而现代化的协议，更契合 QQNT 的内部实现。我们将会在未来的版本中逐步迁移至 Laana，以提供更好的性能和稳定性。同样，我们也将为 NoneBot2 和 Koishi 编写 Laana 的适配器，以便现有的机器人社区尽快迁移至新的协议。一旦协议稳定，我们将会停止对 OneBot 11 协议的维护，不再支持新的 QQNT 特性和修复相关 Bug。

---
## 欢迎回来
NapCatQQ (aka 猫猫框架) 是现代化的基于 NTQQ 的 Bot 协议端实现。

## 猫猫技能
- [x] **高性能**：1K+ 群聊数目、20 线程并行发送消息毫无压力 
- [x] **多种启动方式**：支持以无头、LiteLoader 插件、仅 QQ GUI 三种方式启动
- [x] **多平台支持**: 覆盖 Windows / Linux (可选 Docker) / Android Termux / MacOS
- [x] **安装简单**: 支持一键脚本/程序自动部署/镜像部署等多种覆盖范围
- [x] **低占用**：无头模式占用资源极低，适合在服务器上运行
- [x] **超多接口**：实现大部分 OneBot 和 go-cqhttp 接口，超多扩展 API
- [x] **WebUI**：自带 WebUI 支持，远程管理更加便捷
- [x] **低故障率**：快速适配最新版本，日常保证 0 Issue

## 使用猫猫

可前往 [Release](https://github.com/NapNeko/NapCatQQ/releases/) 页面下载最新版本

**首次使用**请务必前往[官方文档](https://napneko.github.io/)查看使用教程。

## 回家旅途
[QQ Group](https://qm.qq.com/q/VfjAq5HIMS)

[Telegram Link](https://t.me/+nLZEnpne-pQ1OWFl)

## 猫猫朋友
感谢 [LLOneBot](https://github.com/LLOneBot/LLOneBot) 提供部分参考

感谢 [Lagrange](https://github.com/LagrangeDev/Lagrange.Core) 对本项目的大力支持

不过最最重要的 还是需要感谢屏幕前的你哦~

---

## 约法三章
> [!CAUTION]\
> **请不要在 QQ 官方群聊和任何影响力较大的简中互联网平台（包括但不限于: 哔哩哔哩，微博，知乎，抖音等）发布和讨论*任何*与本项目存在相关性的信息**

任何使用本仓库代码的地方，都应当严格遵守[本仓库开源许可](./LICENSE)。**此外，禁止任何项目未经授权二次分发或基于 NapCat 代码开发。**
