import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { NewActionsExamples } from '../example/NewActionsExamples';

export const GetDoubtFriendsAddRequestPayloadSchema = Type.Object({
  count: Type.Number({ default: 50, description: '获取数量' }),
});

export type GetDoubtFriendsAddRequestPayload = Static<typeof GetDoubtFriendsAddRequestPayloadSchema>;

export class GetDoubtFriendsAddRequest extends OneBotAction<GetDoubtFriendsAddRequestPayload, any> {
  override actionName = ActionName.GetDoubtFriendsAddRequest;
  override payloadSchema = GetDoubtFriendsAddRequestPayloadSchema;
  override returnSchema = Type.Any({ description: '可疑好友申请列表' });
  override actionSummary = '获取可疑好友申请';
  override actionDescription = '获取系统的可疑好友申请列表';
  override actionTags = ['系统接口'];
  override payloadExample = NewActionsExamples.GetDoubtFriendsAddRequest.payload;
  override returnExample = NewActionsExamples.GetDoubtFriendsAddRequest.response;

  async _handle (payload: GetDoubtFriendsAddRequestPayload) {
    return await this.core.apis.FriendApi.getDoubtFriendRequest(payload.count);
  }
}
