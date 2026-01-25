import { GroupNotifyMsgStatus } from 'napcat-core';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { OB11NotifySchema } from '../schemas';

import { ActionExamples } from '../examples';

export const GetGroupSystemMsgPayloadSchema = Type.Object({
  count: Type.Union([Type.Number(), Type.String()], { default: 50, description: '获取的消息数量' }),
});

export type GetGroupSystemMsgPayload = Static<typeof GetGroupSystemMsgPayloadSchema>;

export const GetGroupSystemMsgReturnSchema = Type.Object({
  invited_requests: Type.Array(OB11NotifySchema, { description: '进群邀请列表' }),
  InvitedRequest: Type.Array(OB11NotifySchema, { description: '进群邀请列表 (兼容)' }),
  join_requests: Type.Array(OB11NotifySchema, { description: '进群申请列表' }),
});

export type GetGroupSystemMsgReturn = Static<typeof GetGroupSystemMsgReturnSchema>;

export class GetGroupSystemMsg extends OneBotAction<GetGroupSystemMsgPayload, GetGroupSystemMsgReturn> {
  override actionName = ActionName.GetGroupSystemMsg;
  override payloadSchema = GetGroupSystemMsgPayloadSchema;
  override returnSchema = GetGroupSystemMsgReturnSchema;
  override actionDescription = '获取群系统消息';
  override actionTags = ['系统接口'];
  override payloadExample = ActionExamples.GetGroupSystemMsg.payload;
  override returnExample = ActionExamples.GetGroupSystemMsg.return;

  async _handle (params: GetGroupSystemMsgPayload): Promise<GetGroupSystemMsgReturn> {
    const SingleScreenNotifies = await this.core.apis.GroupApi.getSingleScreenNotifies(false, +params.count);
    const retData: GetGroupSystemMsgReturn = { invited_requests: [], InvitedRequest: [], join_requests: [] };

    const notifyPromises = SingleScreenNotifies.map(async (SSNotify) => {
      const invitorUin = SSNotify.user1?.uid ? +await this.core.apis.UserApi.getUinByUidV2(SSNotify.user1.uid) : 0;
      const actorUin = SSNotify.user2?.uid ? +await this.core.apis.UserApi.getUinByUidV2(SSNotify.user2.uid) : 0;
      const commonData = {
        request_id: +SSNotify.seq,
        invitor_uin: invitorUin,
        invitor_nick: SSNotify.user1?.nickName || '',
        group_id: +SSNotify.group?.groupCode,
        message: SSNotify?.postscript || '',
        group_name: SSNotify.group?.groupName || '',
        checked: SSNotify.status !== GroupNotifyMsgStatus.KUNHANDLE,
        actor: actorUin,
        requester_nick: SSNotify.user1?.nickName || '',
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
