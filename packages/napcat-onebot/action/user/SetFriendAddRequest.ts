import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const SetFriendAddRequestPayloadSchema = Type.Object({
  flag: Type.String({ description: '加好友请求的 flag (需从上报中获取)' }),
  approve: Type.Optional(Type.Union([Type.String(), Type.Boolean()], { description: '是否同意请求' })),
  remark: Type.Optional(Type.String({ description: '添加后的好友备注' })),
});

export type SetFriendAddRequestPayload = Static<typeof SetFriendAddRequestPayloadSchema>;

export default class SetFriendAddRequest extends OneBotAction<SetFriendAddRequestPayload, void> {
  override actionName = ActionName.SetFriendAddRequest;
  override payloadSchema = SetFriendAddRequestPayloadSchema;
  override returnSchema = Type.Null();

  async _handle (payload: SetFriendAddRequestPayload): Promise<void> {
    const approve = payload.approve?.toString() !== 'false';
    const notify = (await this.core.apis.FriendApi.getBuddyReq()).buddyReqs.find(e => e.reqTime === payload.flag.toString());
    if (!notify) {
      throw new Error('No such request');
    }
    await this.core.apis.FriendApi.handleFriendRequest(notify, approve);
    if (payload.remark) {
      await this.core.apis.FriendApi.setBuddyRemark(notify.friendUid, payload.remark);
    }
  }
}
