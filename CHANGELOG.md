## 修复与优化
1. 修复图片URL,支持Win/Linux X64获取Rkey - 新增 Module: Moehoo
4. 重构了商城表情URL拼接 - 重构 API: /
5. 重构了Core日志与服务调用部分 - 重构 SYS: Log
6. 适配最新版Win 9.9.9 23159 提升了兼容性 - 修复 SYS: Listener Proxy
7. 修复群成员加入时间 上次活跃 活跃等级字段 - 影响 API: /get_group_member_info /get_group_member_list
8. 修复视频所需的 ffmpeg 路径不正确导致视频封面和时长获取失败 - 影响 Event/API
## 新增与调整
1. 支持获取与设置群公告 - 新增 API： (/_send_group_notice 暂时未完全实现) /_get_group_notice
2. 支持获取群精华消息 - 新增 API： /get_essence_msg_list
3. 支持了设置已读群/私聊消息接口 - 新增 API: /mark_private_msg_as_read /mark_group_msg_as_read
4. 支持了好友添加上报事件 - 新增 Event: AddFriend
5. 支持音乐卡片，需要配置签名服务器地址, `config/onebot11_<qq>.json`的`musicSignUrl`字段 - 新增 Feat: Sign Music
6. 支持wsHost和httpHost配置 - 新增 CONFIG: New
7. 支持获取官方Bot账号范围 - 新增 API: /get_robot_uin_range
8. 支持设置自身在线状态 - 新增 API： /set_online_status
9. 新增表情回应api和上报 - 新增 Event/API
10. 支持获取Cookies 实现更加稳定 - 新增 API: /get_cookies
