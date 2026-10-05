# {VERSION}
[使用文档](https://napneko.github.io/)

## 警告
**注意QQ版本推荐使用 40768+ 版本 最低可以使用40768版本**
**默认WebUi密钥为随机密码 控制台查看**

以下均为腾讯官方 CDN 链接，腾讯会不定期下架旧版本，链接失效时可以在 [Rodert/qq-versions](https://github.com/Rodert/qq-versions/releases) 找同版本的镜像

**[9.9.33-52230 X64 Win（官方 CDN）](https://qqdl.gtimg.cn/qqfile/QQNT/9.9.33/release/497e2f1f/QQ_9.9.33_260813_x64_01.exe)**
[LinuxX64 DEB 52194（官方 CDN）](https://qqdl.gtimg.cn/qqfile/QQNT/9.9.33/release/3f89efc5/QQ_3.2.32_260812_amd64_01.deb)
[LinuxX64 RPM 52194（官方 CDN）](https://qqdl.gtimg.cn/qqfile/QQNT/9.9.33/release/3f89efc5/QQ_3.2.32_260812_x86_64_01.rpm)
[LinuxArm64 DEB 52194（官方 CDN）](https://qqdl.gtimg.cn/qqfile/QQNT/9.9.33/release/3f89efc5/QQ_3.2.32_260812_arm64_01.deb)
[LinuxArm64 RPM 52194（官方 CDN）](https://qqdl.gtimg.cn/qqfile/QQNT/9.9.33/release/3f89efc5/QQ_3.2.32_260812_aarch64_01.rpm)
**MacOS 暂不支持**
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
