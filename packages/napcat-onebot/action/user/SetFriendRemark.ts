import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const SetFriendRemarkPayloadSchema = Type.Object({
  user_id: Type.String({ description: '好友 QQ 号' }),
  remark: Type.String({ description: '备注' }),
});

export type SetFriendRemarkPayload = Static<typeof SetFriendRemarkPayloadSchema>;

export default class SetFriendRemark extends OneBotAction<SetFriendRemarkPayload, void> {
  override actionName = ActionName.SetFriendRemark;
  override payloadSchema = SetFriendRemarkPayloadSchema;
  override returnSchema = Type.Null();

  async _handle (payload: SetFriendRemarkPayload): Promise<void> {
    const friendUid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    const is_friend = await this.core.apis.FriendApi.isBuddy(friendUid);
    if (!is_friend) {
      throw new Error(`用户 ${payload.user_id} 不是好友`);
    }
    await this.core.apis.FriendApi.setBuddyRemark(friendUid, payload.remark);
  }
}
