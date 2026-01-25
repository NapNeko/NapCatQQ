import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { ActionExamples } from '../examples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  user_id: Type.String({ description: '用户QQ' }),
  duration: Type.Union([Type.Number(), Type.String()], { default: 0, description: '禁言时长(秒)' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupBan extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupBan;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionDescription = '群组禁言';
  override actionTags = ['群组接口'];
  override payloadExample = ActionExamples.SetGroupBan.payload;

  async _handle (payload: PayloadType): Promise<null> {
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('uid error');
    const member_role = (await this.core.apis.GroupApi.getGroupMemberEx(payload.group_id.toString(), uid, true))?.role;
    if (member_role === 4) throw new Error('cannot ban owner');
    // 例如无管理员权限时 result为 120101005 errMsg为 'ERR_NOT_GROUP_ADMIN'
    const ret = await this.core.apis.GroupApi.banMember(payload.group_id.toString(),
      [{ uid, timeStamp: +payload.duration }]);
    if (ret.result !== 0) throw new Error(ret.errMsg);
    return null;
  }
}
