import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { NewActionsExamples } from './examples';

export const SetDoubtFriendsAddRequestPayloadSchema = Type.Object({
  flag: Type.String({ description: '请求 flag' }),
  // 注意强制String 非isNumeric 不遵守则不符合设计
  approve: Type.Boolean({ default: true, description: '是否同意 (强制为 true)' }),
  // 该字段没有语义 仅做保留 强制为True
});

export type SetDoubtFriendsAddRequestPayload = Static<typeof SetDoubtFriendsAddRequestPayloadSchema>;

export class SetDoubtFriendsAddRequest extends OneBotAction<SetDoubtFriendsAddRequestPayload, any> {
  override actionName = ActionName.SetDoubtFriendsAddRequest;
  override payloadSchema = SetDoubtFriendsAddRequestPayloadSchema;
  override returnSchema = Type.Any();
  override actionSummary = '处理可疑好友申请';
  override actionDescription = '同意或拒绝系统的可疑好友申请';
  override actionTags = ['系统接口'];
  override payloadExample = NewActionsExamples.SetDoubtFriendsAddRequest.payload;

  async _handle (payload: SetDoubtFriendsAddRequestPayload) {
    return await this.core.apis.FriendApi.handleDoubtFriendRequest(payload.flag);
  }
}
