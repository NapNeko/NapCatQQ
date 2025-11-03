<img src="https://napneko.github.io/assets/newnewlogo.png" width = "305" height = "411" alt="NapCat" align=right />
<div align="center">

# NapCat

_Modern protocol-side framework implemented based on NTQQ._

> 云起兮风生，心向远方兮路未曾至.

</div>

---

## New Feature

在 v4.8.115+ 版本开始

1. NapCatQQ 支持 [Stream Api](https://napneko.github.io/develop/file)
2. NapCatQQ 推荐 message_id/user_id/group_id 均使用字符串类型

- [1] 解决 Docker/跨设备/大文件 的多媒体上下传问题
- [2] 采用字符串可以解决扩展到int64的问题，同时也可以解决部分语言（如JavaScript）对大整数支持不佳的问题，增加极少成本。

## Welcome

- NapCatQQ is a modern implementation of the Bot protocol based on NTQQ.
  - NapCatQQ 是现代化的基于 NTQQ 的 Bot 协议端实现

## Feature

- **Easy to Use**
  - 作为初学者能够轻松使用.
- **Quick and Efficient**
  - 在低内存操作系统长时运行.
- **Rich API Interface**
  - 完整实现了大部分标准接口.
- **Stable and Reliable**
  - 持续稳定的开发与维护.

## Quick Start

可前往 [Release](https://github.com/NapNeko/NapCatQQ/releases/) 页面下载最新版本

**首次使用**请务必查看如下文档看使用教程

> 项目非盈利，对接问题/基础问题/下层框架问题 请自行搜索解决，本项目社区不提供此类解答。

## Development Guide

### 代码提交前检查

在提交代码前，**必须**执行以下命令进行代码检查：

```bash
# 1. 代码格式化修复
npm run lint:fix

# 2. TypeScript 类型检查
npm run tsc
```

#### 关于 TypeScript 类型检查

执行 `npm run tsc` 时，会出现 22 个已知的第三方库类型错误，**这是正常现象**：

```
Found 22 errors in 3 files.

Errors  Files
     3  node_modules/@homebridge/node-pty-prebuilt-multiarch/src/eventEmitter2.ts:42
     2  node_modules/@homebridge/node-pty-prebuilt-multiarch/src/terminal.ts:158
    17  node_modules/@napneko/nap-proto-core/NapProto.ts:94
```

这些错误是由于启用了严格类型检查模式导致的第三方库内部类型问题，**不影响项目运行**。

⚠️ **注意**：除了上述 22 个已知错误外，不应该出现其他类型错误。如果有新的错误，请在提交前修复。

## Link

| Docs | [![Github.IO](https://img.shields.io/badge/docs%20on-Github.IO-orange)](https://napneko.github.io/) | [![Cloudflare.Worker](https://img.shields.io/badge/docs%20on-Cloudflare.Worker-black)](https://doc.napneko.icu/) | [![Cloudflare.HKServer](https://img.shields.io/badge/docs%20on-Cloudflare.HKServer-informational)](https://napcat.napneko.icu/) |
|:-:|:-:|:-:|:-:|

| Docs | [![Cloudflare.Pages](https://img.shields.io/badge/docs%20on-Cloudflare.Pages-blue)](https://napneko.pages.dev/) | [![Server.Other](https://img.shields.io/badge/docs%20on-Server.Other-green)](https://napcat.cyou/) | [![NapCat.Wiki](https://img.shields.io/badge/docs%20on-NapCat.Wiki-red)](https://www.napcat.wiki) |
|:-:|:-:|:-:|:-:|

| QQ Group | [![QQ Group#4](https://img.shields.io/badge/QQ%20Group%234-Join-blue)](https://qm.qq.com/q/CMmPbGw0jA) | [![QQ Group#3](https://img.shields.io/badge/QQ%20Group%233-Join-blue)](https://qm.qq.com/q/8zJMLjqy2Y) | [![QQ Group#2](https://img.shields.io/badge/QQ%20Group%232-Join-blue)](https://qm.qq.com/q/CMmPbGw0jA) | [![QQ Group#1](https://img.shields.io/badge/QQ%20Group%231-Join-blue)](https://qm.qq.com/q/I6LU87a0Yq) |
|:-:|:-:|:-:|:-:|:-:|

| Telegram | [![Telegram](https://img.shields.io/badge/Telegram-napcatqq-blue)](https://t.me/napcatqq) |
|:-:|:-:|

| DeepWiki | [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/NapNeko/NapCatQQ) |
|:-:|:-:|

> 请不要在其余社区提及本项目(包括其余协议端/相关应用端项目)引发争论，如有建议到达官方交流群讨论或PR。

## Thanks

- [Lagrange](https://github.com/LagrangeDev/Lagrange.Core) 对本项目的大力支持 参考部分代码 已获授权

- [AstrBot](https://github.com/AstrBotDevs/AstrBot) 是完美适配本项目的LLM Bot框架 在此推荐一下

- [MaiBot](https://github.com/MaiM-with-u/MaiBot) 一只赛博群友 麦麦 Bot框架 在此推荐一下

- [qq-chat-exporter](https://github.com/shuakami/qq-chat-exporter/) 基于NapCat的消息导出工具 在此推荐一下

- 不过最最重要的 还是需要感谢屏幕前的你哦~

---

## License

本项目采用 混合协议 开源，因此使用本项目时，你需要注意以下几点：

1. 第三方库代码或修改部分遵循其原始开源许可.
2. 本项目获取部分项目授权而不受部分约束
2. 项目其余逻辑代码采用[本仓库开源许可](./LICENSE).

**本仓库仅用于提高易用性，实现消息推送类功能，此外，禁止任何项目未经仓库主作者授权基于 NapCat 代码开发。使用请遵守当地法律法规，由此造成的问题由使用者和提供违规使用教程者负责。**
