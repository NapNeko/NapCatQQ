import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
  user_id: Type.String(),
  remark: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export default class SetFriendRemark extends OneBotAction<Payload, null> {
  override actionName = ActionName.SetFriendRemark;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload): Promise<null> {
    const friendUid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id);
    const is_friend = await this.core.apis.FriendApi.isBuddy(friendUid);
    if (!is_friend) {
      throw new Error(`用户 ${payload.user_id} 不是好友`);
    }
    await this.core.apis.FriendApi.setBuddyRemark(friendUid, payload.remark);
    return null;
  }
}
