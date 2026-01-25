import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { ActionExamples } from '../examples';

export const SetFriendRemarkPayloadSchema = Type.Object({
  user_id: Type.String({ description: '对方 QQ 号' }),
  remark: Type.String({ description: '备注内容' }),
});

export type SetFriendRemarkPayload = Static<typeof SetFriendRemarkPayloadSchema>;

export default class SetFriendRemark extends OneBotAction<SetFriendRemarkPayload, void> {
  override actionName = ActionName.SetFriendRemark;
  override payloadSchema = SetFriendRemarkPayloadSchema;
  override returnSchema = Type.Null();
  override actionDescription = '设置好友备注';
  override actionTags = ['用户接口'];
  override payloadExample = ActionExamples.SetFriendRemark.payload;
  override errorExamples = [
    ...ActionExamples.Common.errors,
    { code: 1400, description: '备注设置失败（好友不存在或非法输入）' }
  ];

  async _handle (payload: SetFriendRemarkPayload): Promise<void> {
    const friendUid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    const is_friend = await this.core.apis.FriendApi.isBuddy(friendUid);
    if (!is_friend) {
      throw new Error(`用户 ${payload.user_id} 不是好友`);
    }
    await this.core.apis.FriendApi.setBuddyRemark(friendUid, payload.remark);
  }
}
