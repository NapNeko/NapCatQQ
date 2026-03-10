import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const SetDoubtFriendsAddRequestPayloadSchema = Type.Object({
  flag: Type.String({ description: '请求 flag' }),
});

export type SetDoubtFriendsAddRequestPayload = Static<typeof SetDoubtFriendsAddRequestPayloadSchema>;

export class SetDoubtFriendsAddRequest extends OneBotAction<SetDoubtFriendsAddRequestPayload, any> {
  override actionName = ActionName.SetDoubtFriendsAddRequest;
  override payloadSchema = SetDoubtFriendsAddRequestPayloadSchema;
  override returnSchema = Type.Any();
  override actionSummary = '处理可疑好友申请';
  override actionDescription = '同意并处理系统的可疑好友申请';
  override actionTags = ['系统接口'];
  override payloadExample = {
    flag: '12345',
  };

  override returnExample = null;

  async _handle (payload: SetDoubtFriendsAddRequestPayload) {
    return await this.core.apis.FriendApi.handleDoubtFriendRequest(payload.flag);
  }
}
