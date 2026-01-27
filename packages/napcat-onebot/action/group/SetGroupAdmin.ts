import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { NTGroupMemberRole } from 'napcat-core/types';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { GroupActionsExamples } from '../example/GroupActionsExamples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  user_id: Type.String({ description: '用户QQ' }),
  enable: Type.Optional(Type.Union([Type.Boolean(), Type.String()], { description: '是否设置为管理员' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupAdmin extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupAdmin;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '设置群管理员';
  override actionDescription = '设置或取消群聊中的管理员';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.SetGroupAdmin.payload;
  override returnExample = GroupActionsExamples.SetGroupAdmin.response;

  async _handle (payload: PayloadType): Promise<null> {
    const enable = typeof payload.enable === 'string' ? payload.enable === 'true' : !!payload.enable;
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('get Uid Error');
    await this.core.apis.GroupApi.setMemberRole(payload.group_id.toString(), uid, enable ? NTGroupMemberRole.KADMIN : NTGroupMemberRole.KMEMBER);
    return null;
  }
}
