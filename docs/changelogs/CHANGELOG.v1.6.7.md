# v1.6.7

QQ Version: Windows 9.9.12-26000 / Linux 3.2.9-26000
## 使用前警告
1. 在最近版本由于QQ本体大幅变动，为了保证NapCat可用性，NapCat近期启动与安装方式将将大幅变动，请关注文档和社群获取。
2. 在Core上完全执行开源，请不要用于违法用途，如此可能造成NapCat完全停止更新。
3. 针对原启动方式的围堵，NapCat研发了多种方式，除此其余理论与扩展的分析和思路将部分展示于Docs，以便各位参与开发与维护NapCat。
## 其余·备注
启动方式: WayBoot.03 （Electron Main进程为Node 直接注入代码 同理项目: LiteLoader）

## 修复与优化
1. 尝试 修复 卡顿问题
2. 尝试 修复 精华消息被设置/一起听 接受时的报错
3. 优化 Uin与Uid 转换速度
4. 修复CQCode可能存在的解码问题

## 新增与调整
1. 戳一戳上报raw
2. 精华消息设置通知事件
3. 新增设置/删除群精华API
4. 新增最近联系列表API（RAW 不稳定）
5. 上报群精华设置事件
6. 新增设置所有消息已读API（非标准）
7. 新增获取点赞信息获取API（非标准）

新增的 API 详细见[API文档](https://napneko.github.io/zh-CN/develop/extends_api)
