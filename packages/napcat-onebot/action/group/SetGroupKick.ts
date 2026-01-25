import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { GroupActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  user_id: Type.String({ description: '用户QQ' }),
  reject_add_request: Type.Optional(Type.Union([Type.Boolean(), Type.String()], { description: '是否拒绝加群请求' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupKick extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupKick;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '群组踢人';
  override actionDescription = '将指定成员踢出群聊';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.SetGroupKick.payload;
  override returnExample = GroupActionsExamples.SetGroupKick.response;

  async _handle (payload: PayloadType): Promise<null> {
    const rejectReq = payload.reject_add_request?.toString() === 'true';
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('get Uid Error');
    await this.core.apis.GroupApi.kickMember(payload.group_id.toString(), [uid], rejectReq);
    return null;
  }
}
