1. 修复图片URL,支持Win/Linux X64获取Rkey
2. 支持了设置已读群/私聊消息接口
3. 支持了好友添加上报事件
4. 重构了商城表情URL拼接
5. 重构了Core日志与服务调用部分
6. 适配最新版Win 9.9.9 23159 提升了兼容性
7. 表情回应api和上报
8. 支持获取Cookies 实现更加稳定 API: /get_cookies
9. 新增wsHost和httpHost配置 CONFIG: New
10. 新增获取官方Bot账号范围 API: /get_robot_uin_range
11. 新增设置自身在线状态 API： /set_online_status
12. 修复群成员加入时间 上次活跃 活跃等级字段 影响 API: /get_group_member_info /get_group_member_list