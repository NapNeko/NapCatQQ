# {VERSION}
[使用文档](https://napneko.github.io/)

## Windows 一键包
我们为提供了的轻量化一键部署方案
相对于普通需要安装QQ的方案,下面已内置QQ和Napcat 阅读使用文档参考

你可以下载 

NapCat.Shell.Windows.OneKey.zip (无头)

启动后可自动化部署一键包,教程参考使用文档安装部分

## 警告
**注意QQ版本推荐使用 40768+ 版本 最低可以使用40768版本**
**默认WebUi密钥为随机密码 控制台查看**

**[9.9.22-40990 X64 Win](https://dldir1v6.qq.com/qqfile/qq/QQNT/2c9d3f6c/QQ9.9.22.40990_x64.exe)**
[LinuxX64 DEB 40990 ](https://dldir1.qq.com/qqfile/qq/QQNT/ec800879/linuxqq_3.2.20-40990_amd64.deb)
[LinuxX64 RPM 40990 ](https://dldir1.qq.com/qqfile/qq/QQNT/ec800879/linuxqq_3.2.20-40990_x86_64.rpm)
[LinuxArm64 DEB 40990 ](https://dldir1.qq.com/qqfile/qq/QQNT/ec800879/linuxqq_3.2.20-40990_arm64.deb)
[LinuxArm64 RPM  40990 ](https://dldir1.qq.com/qqfile/qq/QQNT/ec800879/linuxqq_3.2.20-40990_aarch64.rpm)
[MAC   DMG   40990 ](https://dldir1v6.qq.com/qqfile/qq/QQNT/c6cb0f5d/QQ_v6.9.82.40990.dmg)
## 如果WinX64缺少运行库或者xxx.dll？
[安装运行库](https://aka.ms/vs/17/release/vc_redist.x64.exe)

## 更新

### 🐛 修复
1. 修复 WebUI 主题配置在有未保存更改时卸载组件导致字体重置的问题 (ae42eed6)

### ✨ 新增
1. 文件上传相关接口（UploadGroupFile/UploadPrivateFile）新增 `upload_file` 参数支持 (91e0839e)
2. 消息发送逻辑支持 PTT（语音）元素过滤，确保语音消息正确独立发送 (47983e29)

### 🔧 优化
1. 优化合并转发消息（GetForwardMsg）的获取与解析逻辑，提高兼容性 (334c4233)
2. 改进消息发送方法中发送者 UIN 的处理逻辑 (71bb4f68)
3. 增强 WebUI 系统信息界面中对构建产物的处理与展示 (cb061890)

---

**完整更新日志**: [v4.10.6...v4.10.7](https://github.com/NapNeko/NapCatQQ/compare/v4.10.6...v4.10.7)
