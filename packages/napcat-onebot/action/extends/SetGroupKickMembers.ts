import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { ExtendsActionsExamples } from '../example/ExtendsActionsExamples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  user_id: Type.Array(Type.String(), { description: 'QQ号列表' }),
  reject_add_request: Type.Optional(Type.Union([Type.Boolean(), Type.String()], { description: '是否拒绝加群请求' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '返回结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupKickMembers extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupKickMembers;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '批量踢出群成员';
  override actionDescription = '从指定群聊中批量踢出多个成员';
  override actionTags = ['扩展接口'];
  override payloadExample = ExtendsActionsExamples.SetGroupKickMembers.payload;
  override returnExample = ExtendsActionsExamples.SetGroupKickMembers.response;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const rejectReq = payload.reject_add_request?.toString() === 'true';
    const uids: string[] = await Promise.all(payload.user_id.map(async uin => await this.core.apis.UserApi.getUidByUinV2(uin)));
    await this.core.apis.GroupApi.kickMember(payload.group_id.toString(), uids.filter(uid => !!uid), rejectReq);
    return null;
  }
}
