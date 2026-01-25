import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { GroupActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  enable: Type.Optional(Type.Union([Type.Boolean(), Type.String()], { description: '是否开启全员禁言' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupWholeBan extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupWholeBan;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '全员禁言';
  override actionDescription = '开启或关闭指定群聊的全员禁言';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.SetGroupWholeBan.payload;
  override returnExample = GroupActionsExamples.SetGroupWholeBan.response;

  async _handle (payload: PayloadType): Promise<null> {
    const enable = payload.enable?.toString() !== 'false';
    const res = await this.core.apis.GroupApi.banGroup(payload.group_id.toString(), enable);
    if (res.result !== 0) {
      throw new Error(`SetGroupWholeBan failed: ${res.errMsg} ${res.result}`);
    }
    return null;
  }
}
