import { GroupNotifyMsgStatus } from 'napcat-core';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({}, { description: '群忽略通知负载' });

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  invited_requests: Type.Array(Type.Any(), { description: '邀请请求列表' }),
  InvitedRequest: Type.Array(Type.Any(), { description: '邀请请求列表' }),
  join_requests: Type.Array(Type.Any(), { description: '加入请求列表' }),
}, { description: '群忽略通知结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupIgnoredNotifies extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGroupIgnoredNotifies;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取群忽略通知';
  override actionDescription = '获取被忽略的入群申请和邀请通知';
  override actionTags = ['群组接口'];

  async _handle (): Promise<ReturnType> {
    const SingleScreenNotifies = await this.core.apis.GroupApi.getSingleScreenNotifies(false, 50);
    const retData: ReturnType = { invited_requests: [], InvitedRequest: [], join_requests: [] };

    const notifyPromises = SingleScreenNotifies.map(async (SSNotify) => {
      const invitorUin = SSNotify.user1?.uid ? +await this.core.apis.UserApi.getUinByUidV2(SSNotify.user1.uid) : 0;
      const actorUin = SSNotify.user2?.uid ? +await this.core.apis.UserApi.getUinByUidV2(SSNotify.user2.uid) : 0;
      const commonData = {
        request_id: +SSNotify.seq,
        invitor_uin: invitorUin,
        invitor_nick: SSNotify.user1?.nickName,
        group_id: +SSNotify.group?.groupCode,
        message: SSNotify?.postscript,
        group_name: SSNotify.group?.groupName,
        checked: SSNotify.status !== GroupNotifyMsgStatus.KUNHANDLE,
        actor: actorUin,
        requester_nick: SSNotify.user1?.nickName,
      };

      if (SSNotify.type === 1) {
        retData.InvitedRequest.push(commonData);
      } else if (SSNotify.type === 7) {
        retData.join_requests.push(commonData);
      }
    });

    await Promise.all(notifyPromises);
    retData.invited_requests = retData.InvitedRequest;
    return retData;
  }
}
