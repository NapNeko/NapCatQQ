import { Static, Type } from '@sinclair/typebox';
import { SatoriAction } from '../SatoriAction';
import { SatoriActionName } from '../router';

const SchemaData = Type.Object({
  message_id: Type.String(),
  approve: Type.Boolean(),
  comment: Type.Optional(Type.String()),
});

type Payload = Static<typeof SchemaData>;

export class FriendApproveAction extends SatoriAction<Payload, void> {
  actionName = SatoriActionName.FriendApprove;
  override payloadSchema = SchemaData;

  protected async _handle (payload: Payload): Promise<void> {
    const { message_id, approve } = payload;

    // message_id 格式: reqTime (好友请求的时间戳)
    // 需要从好友请求列表中找到对应的请求
    const buddyReqData = await this.core.apis.FriendApi.getBuddyReq();
    const notify = buddyReqData.buddyReqs.find((e) => e.reqTime === message_id);

    if (!notify) {
      throw new Error(`未找到好友请求: ${message_id}`);
    }

    await this.core.apis.FriendApi.handleFriendRequest(notify, approve);
  }
}
