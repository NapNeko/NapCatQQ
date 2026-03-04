import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  status: Type.Union([Type.Number(), Type.String()], { description: '在线状态' }),
  ext_status: Type.Union([Type.Number(), Type.String()], { description: '扩展状态' }),
  battery_status: Type.Union([Type.Number(), Type.String()], { description: '电量状态' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '设置结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class SetOnlineStatus extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetOnlineStatus;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '设置在线状态';
  override actionDescription = statusText;
  override actionTags = ['系统扩展'];
  override payloadExample = {
    status: 11,
    ext_status: 0,
    battery_status: 100
  };
  override returnExample = null;

  async _handle (payload: PayloadType) {
    const ret = await this.core.apis.UserApi.setSelfOnlineStatus(
      +payload.status,
      +payload.ext_status,
      +payload.battery_status
    );
    if (ret.result !== 0) {
      throw new Error('设置在线状态失败');
    }
    return null;
  }
}

const statusText = `
## 状态列表

### 在线
\`\`\`json5;
{ "status": 10, "ext_status": 0, "battery_status": 0; }
\`\`\`

### Q我吧
\`\`\`json5;
{ "status": 60, "ext_status": 0, "battery_status": 0; }
\`\`\`

### 离开
\`\`\`json5;
{ "status": 30, "ext_status": 0, "battery_status": 0; }
\`\`\`

### 忙碌
\`\`\`json5;
{ "status": 50, "ext_status": 0, "battery_status": 0; }
\`\`\`

### 请勿打扰
\`\`\`json5;
{ "status": 70, "ext_status": 0, "battery_status": 0; }
\`\`\`

### 隐身
\`\`\`json5;
{ "status": 40, "ext_status": 0, "battery_status": 0; }
\`\`\`

### 听歌中
\`\`\`json5;
{ "status": 10, "ext_status": 1028, "battery_status": 0; }
\`\`\`

### 春日限定
\`\`\`json5;
{ "status": 10, "ext_status": 2037, "battery_status": 0; }
\`\`\`

### 一起元梦
\`\`\`json5;
{ "status": 10, "ext_status": 2025, "battery_status": 0; }
\`\`\`

### 求星搭子
\`\`\`json5;
{ "status": 10, "ext_status": 2026, "battery_status": 0; }
\`\`\`

### 被掏空
\`\`\`json5;
{ "status": 10, "ext_status": 2014, "battery_status": 0; }
\`\`\`

### 今日天气
\`\`\`json5;
{ "status": 10, "ext_status": 1030, "battery_status": 0; }
\`\`\`

### 我crash了
\`\`\`json5;
{ "status": 10, "ext_status": 2019, "battery_status": 0; }
\`\`\`

### 爱你
\`\`\`json5;
{ "status": 10, "ext_status": 2006, "battery_status": 0; }
\`\`\`

### 恋爱中
\`\`\`json5;
{ "status": 10, "ext_status": 1051, "battery_status": 0; }
\`\`\`

### 好运锦鲤
\`\`\`json5;
{ "status": 10, "ext_status": 1071, "battery_status": 0; }
\`\`\`

### 水逆退散
\`\`\`json5;
{ "status": 10, "ext_status": 1201, "battery_status": 0; }
\`\`\`

### 嗨到飞起
\`\`\`json5;
{ "status": 10, "ext_status": 1056, "battery_status": 0; }
\`\`\`

### 元气满满
\`\`\`json5;
{ "status": 10, "ext_status": 1058, "battery_status": 0; }
\`\`\`

### 宝宝认证
\`\`\`json5;
{ "status": 10, "ext_status": 1070, "battery_status": 0; }
\`\`\`

### 一言难尽
\`\`\`json5;
{ "status": 10, "ext_status": 1063, "battery_status": 0; }
\`\`\`

### 难得糊涂
\`\`\`json5;
{ "status": 10, "ext_status": 2001, "battery_status": 0; }
\`\`\`

### emo中
\`\`\`json5;
{ "status": 10, "ext_status": 1401, "battery_status": 0; }
\`\`\`

### 我太难了
\`\`\`json5;
{ "status": 10, "ext_status": 1062, "battery_status": 0; }
\`\`\`

### 我想开了
\`\`\`json5;
{ "status": 10, "ext_status": 2013, "battery_status": 0; }
\`\`\`

### 我没事
\`\`\`json5;
{ "status": 10, "ext_status": 1052, "battery_status": 0; }
\`\`\`

### 想静静
\`\`\`json5;
{ "status": 10, "ext_status": 1061, "battery_status": 0; }
\`\`\`

### 悠哉哉
\`\`\`json5;
{ "status": 10, "ext_status": 1059, "battery_status": 0; }
\`\`\`

### 去旅行
\`\`\`json5;
{ "status": 10, "ext_status": 2015, "battery_status": 0; }
\`\`\`

### 信号弱
\`\`\`json5;
{ "status": 10, "ext_status": 1011, "battery_status": 0; }
\`\`\`

### 出去浪
\`\`\`json5;
{ "status": 10, "ext_status": 2003, "battery_status": 0; }
\`\`\`

### 肝作业
\`\`\`json5;
{ "status": 10, "ext_status": 2012, "battery_status": 0; }
\`\`\`

### 学习中
\`\`\`json5;
{ "status": 10, "ext_status": 1018, "battery_status": 0; }
\`\`\`

### 搬砖中
\`\`\`json5;
{ "status": 10, "ext_status": 2023, "battery_status": 0; }
\`\`\`

### 摸鱼中
\`\`\`json5;
{ "status": 10, "ext_status": 1300, "battery_status": 0; }
\`\`\`

### 无聊中
\`\`\`json5;
{ "status": 10, "ext_status": 1060, "battery_status": 0; }
\`\`\`

### timi中
\`\`\`json5;
{ "status": 10, "ext_status": 1027, "battery_status": 0; }
\`\`\`

### 睡觉中
\`\`\`json5;
{ "status": 10, "ext_status": 1016, "battery_status": 0; }
\`\`\`

### 熬夜中
\`\`\`json5;
{ "status": 10, "ext_status": 1032, "battery_status": 0; }
\`\`\`

### 追剧中
\`\`\`json5;
{ "status": 10, "ext_status": 1021, "battery_status": 0; }
\`\`\`

### 我的电量
\`\`\`json5;
{
  "status": 10,
    "ext_status": 1000,
      "battery_status": 0;
}
\`\`\`
`;