import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const GetDoubtFriendsAddRequestPayloadSchema = Type.Object({
  count: Type.Number({ default: 50, description: '获取数量' }),
});

export type GetDoubtFriendsAddRequestPayload = Static<typeof GetDoubtFriendsAddRequestPayloadSchema>;

export class GetDoubtFriendsAddRequest extends OneBotAction<GetDoubtFriendsAddRequestPayload, any> {
  override actionName = ActionName.GetDoubtFriendsAddRequest;
  override payloadSchema = GetDoubtFriendsAddRequestPayloadSchema;
  override returnSchema = Type.Any({ description: '可疑好友申请列表' });

  async _handle (payload: GetDoubtFriendsAddRequestPayload) {
    return await this.core.apis.FriendApi.getDoubtFriendRequest(payload.count);
  }
}
