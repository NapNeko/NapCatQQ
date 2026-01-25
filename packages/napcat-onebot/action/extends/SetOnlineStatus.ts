import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { ActionExamples } from '../examples';

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
  override actionDescription = '设置在线状态';
  override actionTags = ['扩展接口'];
  override payloadExample = ActionExamples.SetOnlineStatus.payload;

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
