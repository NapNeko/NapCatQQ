# v1.8.0

QQ Version: Windows 9.9.15-26702 / Linux 3.2.12-26702

## 启动的方式
Way03/Way05

## 新增与调整
1. 消息ID映射到UINT32空间
2. 回复ID验证与修复
3. 新API /fetch_emoji_like

```json5
{
    "message_id": 1557274996,//消息ID
    "emojiType": "1",//可以从event事件获取 一般为1或者2
    "emojiId": "76"//可以从event事件获取 一个表情对应一个ID
}
```

新增的 API 详细见[API文档](https://napneko.github.io/zh-CN/develop/extends_api)
