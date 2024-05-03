# v1.2.0

QQ Version: Windows 9.9.9-23361 / Linux 3.2.7-23361

## 修复与优化
* 修复图片URL,支持 Win/Linux X64 获取Rkey，暂时不支持arm64
* 适配最新版 Windows 9.9.9-23361 / Linux 3.2.7-23361 提升了兼容性 - 修复 SYS: Listener Proxy
* 修复群成员加入时间 上次活跃 活跃等级字段 - 影响 API: /get_group_member_info /get_group_member_list
* 修复视频所需的 ffmpeg 路径不正确导致视频封面和时长获取失败 - 影响 Event/API
* 优化数据库对消息储存，消耗储存减少 - 影响 Sys: OneBot
* 修复他人管理员被撤销时没有上报

## 新增与调整
* 支持商城表情发送和上报 url
* 支持获取群公告 - 新增 API： /_get_group_notice
* 支持了设置已读群/私聊消息接口 - 新增 API: /mark_private_msg_as_read /mark_group_msg_as_read
* 支持了好友添加上报事件 - 新增 Event: AddFriend
* 支持wsHost和httpHost配置
* 支持获取官方Bot账号范围 - 新增 API: /get_robot_uin_range
* 支持设置自身在线状态 - 新增 API： /set_online_status
* 支持表情回应api和上报 - 新增 Event/API
* 支持获取Cookies 实现更加稳定 且支持Skey缓存3600S Pskey每次刷新 - 新增 API: /get_cookies
* 支持 服务端踢下线 / 其它设备上线 / 重复登录 / 自身在线状态变更 日志 - 新增 Sys: Log
* 支持了消息统计 - API: /get_status
* 支持单条消息转发 - API /forward_friend_single_msg、/forward_group_single_msg

新增的 API 详细见[API文档](https://napneko.github.io/zh-CN/develop/extends_api)
