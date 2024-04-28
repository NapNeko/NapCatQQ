1. 修复图片URL,支持Win/Linux X64获取rkey, arm64暂不支持
2. 支持了设置已读群/私聊消息接口
3. 支持了好友添加上报事件
4. 商城表情上报URL
5. 重构了Core日志与服务调用部分, 日志可在`config/napcat_<QQ号>.json`中配置日志开关和等级
6. 适配最新版Win 9.9.9 23159 提升了兼容性
7. 表情回应api和上报
8. 支持获取Cookies 实现更加稳定 API: /get_cookies
9. 新增wsHost和httpHost配置 CONFIG: New
10. 新增获取官方Bot账号范围 API: /get_robot_uin_range
11. 新增设置自身在线状态 API： /set_online_status
12. 修复视频所需的 ffmpeg 路径不正确导致视频封面和市场获取失败
