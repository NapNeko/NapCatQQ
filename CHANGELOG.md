1. 修复图片URL,支持Win/Linux X64获取Rkey - 新增 Module: Moehoo
2. 支持了设置已读群/私聊消息接口 - 新增 API: /mark_private_msg_as_read /mark_group_msg_as_read
3. 支持了好友添加上报事件 - 新增 Event: AddFriend
4. 重构了商城表情URL拼接 - 重构 API: /
5. 重构了Core日志与服务调用部分 - 重构 SYS: Log
6. 适配最新版Win 9.9.9 23159 提升了兼容性 - 修复 SYS: Listener
7. 表情回应api和上报 - 新增 Event/API
8. 支持获取Cookies 实现更加稳定 - 新增 API: /get_cookies
9. 新增wsHost和httpHost配置 - 新增 CONFIG: New
10. 新增获取官方Bot账号范围 - 新增 API: /get_robot_uin_range
11. 新增设置自身在线状态 - 新增 API： /set_online_status
12. 修复群成员加入时间 上次活跃 活跃等级字段 - 影响 API: /get_group_member_info /get_group_member_list
13. 修复视频所需的 ffmpeg 路径不正确导致视频封面和时长获取失败
