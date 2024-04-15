<div align="center">
  <img src="https://socialify.git.ci/NapNeko/NapCatQQ/image?description=1&language=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2FNapNeko%2FNapCatQQ%2Fmain%2Flogo.png&name=1&stargazers=1&theme=Auto" alt="NapCatQQ" width="640" height="320" />
</div>

## 项目介绍

NapCatQQ（瞌睡猫QQ，不准叫我NCQQ！），像睡着了一样在后台低占用运行的无头(没有界面)的NTQQ

目前测试在 Windows 上表现优秀，最低可达只占用内存 **20M**左右

由于 Linux 上的 QQ 图形依赖较多，会导致内存占用小高，大约 **100+M**，目前正在研究如何优化

具体占用会因人而异，QQ 群、好友越多占用越高

## 下载

前往 Release 页面下载最新版本

## 启动

NapCat 是基于 官方NTQQ 实现的Bot框架，因此先需要安装官方QQ，**注意同个账号不能同时登录原版 QQ 和 NapCatQQ**

*如果没有安装 QQ 请往后翻查看安装方法*

修改 `config/onebot11.json`内容，并重名为 `onebot11_<你的QQ号>.json`，如`onebot11_1234567.json`

json 配置内容参数解释：

```json5
{
  // 是否启用http服务，如果启用，可以通过http接口发送消息
  "enableHttp": false,
  // http服务端口
  "httpPort": 3000,
  // 是否启用正向websocket服务
  "enableWs": false,
  // 正向websocket服务端口
  "wsPort": 3001,
  // 是否启用反向websocket服务
  "enableWsReverse": false,
  // 反向websocket对接的地址, 如["ws://127.0.0.1:8080/onebot/v11/ws"]
  "wsReverseUrls": [],
  // 是否启用http上报服务
  "enableHttpPost": false,
  // http上报地址, 如["http://127.0.0.1:8080/onebot/v11/http"]
  "httpPostUrls": [],
  // http上报密钥，可为空
  "httpSecret": "",
  // 消息上报格式，array为消息组，string为cq码字符串
  "messagePostFormat": "array",
  // 是否上报自己发送的消息
  "reportSelfMessage": false,
  // 是否开启调试模式，开启后上报消息会携带一个raw字段，为原始消息内容
  "debug": false,
  // 调用get_file接口时如果获取不到url则使用base64字段返回文件内容
  "enableLocalFile2Url": true,
  // ws心跳间隔，单位毫秒
  "heartInterval": 30000,
  // access_token，可以为空
  "token": ""
}

```

### Windows 启动

运行`powershell ./napcat.ps1`, 或者 `napcat.bat`，如果出现乱码，可以尝试运行`napcat-utf8.ps1` 或 `napcat-utf8.bat`

*如果出现 powershell 运行不了，以管理员身份打开 powershell，输入 `Set-ExecutionPolicy RemoteSigned`*

### Linux 启动

运行`napcat.sh`

## 使用无需扫码快速登录

前提是你已经成功登录过QQ，可以加参数` -q <你的QQ>` 进行登录，如`napcat.sh -q 1234567`

## 安装

### Linux安装

#### 安装 Linux QQ(22741)，已经安装了的可以跳过

目前还在研究怎么精简安装，暂时只能安装官方QQ整体依赖

下载QQ
 
[deb x86版本](https://dldir1.qq.com/qqfile/qq/QQNT/Linux/QQ_3.2.7_240403_amd64_01.deb)
[deb arm版本](https://dldir1.qq.com/qqfile/qq/QQNT/Linux/QQ_3.2.7_240403_arm64_01.deb)

[rpm x86版本](https://dldir1.qq.com/qqfile/qq/QQNT/Linux/QQ_3.2.7_240403_x86_64_01.rpm)
[rpm arm版本](https://dldir1.qq.com/qqfile/qq/QQNT/Linux/QQ_3.2.7_240403_aarch64_01.rpm)

```bash
sudo apt install ./qq.deb
```

```bash
安装QQ的依赖
sudo apt install libgbm1 libasound2
```

### Windows 安装

#### 安装Windows QQ(22741)，已经安装了的可以跳过

[Windows版本QQ下载](https://dldir1.qq.com/qqfile/qq/QQNT/Windows/QQ_9.9.9_240403_x64_01.exe)

### 编译安装 NapCat

**如果你是直接下载编译好的版本，可以跳过这一步**

准备环境 [node18.18](https://nodejs.org/download/release/v18.18.2/)

```
export NODE_ENV=production
npm install
```

## 常见问题

### 二维码无法扫描

NapCat 会自动保存二维码到目录，可以手动打开图片扫描

如果没有条件访问本地目录，可以将二维码解析的 url 复制到二维码生成网站上生成二维码，然后手机QQ扫描

### 语音、视频发送失败

需要配置 ffmpeg，将 ffmpeg 目录加入环境变量，如果仍未生效，可以修改 napcat 启动脚本加入 FFMPEG_PATH 变量指定到 ffmpeg
程序的完整路径

如 Windows 上修改 napcat.ps1，在第一行加入

```powershell
$env:FFMPEG_PATH="d:\ffmpeg\bin\ffmpeg.exe"
```

### 出现 error code v2:-1 之类的提示

不用管，这是正常现象，是因为 QQ 本身的问题，不影响使用

## API 文档

参考 [LLOneBot](https://llonebot.github.io/zh-CN/develop/api) 的文档

<!-- 
QQ群：545402644
-->

## 声明

* 请不要在无关地方宣传NapCatQQ，本项目只是用于学习 node 相关知识，切勿用于违法用途

* NapCat 不会收集用户隐私信息，但是未来可能会为了更好的利于 NapCat 的优化会收集一些设备信息，如 cpu 架构，系统版本等
  
## 相关链接

[TG群](https://t.me/+nLZEnpne-pQ1OWFl)

## 鸣谢名单
[OpenShamrock]()

[Lagrange]()
