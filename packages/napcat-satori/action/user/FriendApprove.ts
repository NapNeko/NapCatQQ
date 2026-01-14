import { SatoriAction } from '../SatoriAction';

interface FriendApprovePayload {
  message_id: string;
  approve: boolean;
  comment?: string;
}

export class FriendApproveAction extends SatoriAction<FriendApprovePayload, void> {
  actionName = 'friend.approve';

  async handle (payload: FriendApprovePayload): Promise<void> {
    const { message_id, approve } = payload;

    // message_id 格式: reqTime (好友请求的时间戳)
    // 需要从好友请求列表中找到对应的请求
    const buddyReqData = await this.core.apis.FriendApi.getBuddyReq();
    const notify = buddyReqData.buddyReqs.find(e => e.reqTime === message_id);

    if (!notify) {
      throw new Error(`未找到好友请求: ${message_id}`);
    }

    await this.core.apis.FriendApi.handleFriendRequest(notify, approve);
  }
}
