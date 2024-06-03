# v1.3.5

QQ Version: Windows 9.9.9-23424 / Linux 3.2.7-23361

## 修复与优化
* 优化启动脚本
* 修复非管理时群成员减少事件上报 **无法获取操作者与操作类型**
* 修复快速重启进程清理问题
* 优化配置文件格式 支持自动更新配置 但仍然建议 **备份配置**
* 修复正向反向ws多个客户端周期多次心跳问题

## 新增与调整
* 支持WebUi热重载
* 新增启动输出WEBUI秘钥
* 新增群荣誉信息 /get_group_honor_info
* 支持获取群系统消息 /get_group_system_msg

新增的 API 详细见[API文档](https://napneko.github.io/zh-CN/develop/extends_api)
