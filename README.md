<div align="center">
  
  ![Logo](https://socialify.git.ci/NapNeko/NapCatQQ/image?font=Jost&logo=https%3A%2F%2Fnapneko.github.io%2Fassets%2Flogo.png&name=1&owner=1&pattern=Diagonal%20Stripes&stargazers=1&theme=Auto)
  
</div>

---
## 欢迎回家
NapCatQQ 是现代化的基于 NTQQ 的 Bot 协议端实现

## 特性介绍
- [x] **安装简单**：就算是笨蛋也能使用
- [x] **性能友好**：就算是低内存也能使用
- [x] **接口丰富**：就算是没有也能使用
- [x] **稳定好用**：就算是被捉也能使用

## 使用框架

可前往 [Release](https://github.com/NapNeko/NapCatQQ/releases/) 页面下载最新版本

**首次使用**请务必查看如下文档看使用教程

### 文档地址

[Cloudflare.Worker](https://doc.napneko.icu/)

[Cloudflare.HKServer](https://napcat.napneko.icu/)

[Github.IO](https://napneko.github.io/)

[Cloudflare.Pages](https://napneko.pages.dev/)

[Server.Other](https://docs.napcat.cyou/)

## 回家旅途
[QQ Group](https://qm.qq.com/q/I6LU87a0Yq)

## 性能设计/协议标准
NapCat 已实现90％+的 OneBot / GoCQ 标准接口，并提供兼容性保留接口，其设计理念遵守 无数据库/异步优先/后台刷新 的性能思想。

由此设计带来一系列好处，在开发中，获取群员列表通常小于50Ms，单条文本消息发送在320Ms以内，在1k+的群聊流畅运行，同时带来一些副作用，上报数据中大量使用Magic生成字段，消息Id无法持久，无法上报撤回消息原始内容。

NapCat 在设计理念下遵守 OneBot 规范大多数要求并且积极改进，任何合理的标准化 Issue 与 Pr 将被接收。

## 感谢他们
感谢 [Lagrange](https://github.com/LagrangeDev/Lagrange.Core) 对本项目的大力支持 参考部分代码 已获授权

感谢 Tencent Tdesign / Vue3 强力驱动 NapCat.WebUi

不过最最重要的 还是需要感谢屏幕前的你哦~

---

## 特殊感谢
[LLOneBot](https://github.com/LLOneBot/LLOneBot) 相关的开发曾参与本项目

## 开源附加

任何使用本仓库代码的地方，都应当严格遵守[本仓库开源许可](./LICENSE)。**此外，禁止任何项目未经仓库主作者授权二次分发或基于 NapCat 代码开发。**
