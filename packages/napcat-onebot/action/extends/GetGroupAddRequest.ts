import { GroupNotifyMsgStatus } from 'napcat-core';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

const ReturnSchema = Type.Array(
  Type.Object({
    request_id: Type.Number({ description: '请求ID' }),
    invitor_uin: Type.Number({ description: '邀请者QQ' }),
    invitor_nick: Type.Optional(Type.String({ description: '邀请者昵称' })),
    group_id: Type.Number({ description: '群号' }),
    message: Type.Optional(Type.String({ description: '验证信息' })),
    group_name: Type.Optional(Type.String({ description: '群名称' })),
    checked: Type.Boolean({ description: '是否已处理' }),
    actor: Type.Number({ description: '处理者QQ' }),
    requester_nick: Type.Optional(Type.String({ description: '请求者昵称' })),
  }),
  { description: '群通知列表' }
);

type ReturnType = Static<typeof ReturnSchema>;

export default class GetGroupAddRequest extends OneBotAction<void, ReturnType> {
  override actionName = ActionName.GetGroupIgnoreAddRequest;
  override payloadSchema = Type.Void();
  override returnSchema = ReturnSchema;
  override actionSummary = '获取群被忽略的加群请求';
  override actionTags = ['群组接口'];
  override payloadExample = {};
  override returnExample = [
    {
      request_id: 12345,
      invitor_uin: 123456789,
      invitor_nick: '邀请者',
      group_id: 123456789,
      message: '加群请求',
      group_name: '群名称',
      checked: false,
      actor: 0,
      requester_nick: '请求者'
    }
  ];

  async _handle (): Promise<ReturnType> {
    const NTQQUserApi = this.core.apis.UserApi;
    const NTQQGroupApi = this.core.apis.GroupApi;
    const ignoredNotifies = await NTQQGroupApi.getSingleScreenNotifies(true, 10);
    const retData: ReturnType = [];

    const notifyPromises = ignoredNotifies
      .filter(notify => notify.type === 7)
      .map(async SSNotify => {
        const invitorUin = SSNotify.user1?.uid ? +await NTQQUserApi.getUinByUidV2(SSNotify.user1.uid) : 0;
        const actorUin = SSNotify.user2?.uid ? +await NTQQUserApi.getUinByUidV2(SSNotify.user2.uid) : 0;
        retData.push({
          request_id: +SSNotify.seq,
          invitor_uin: invitorUin,
          invitor_nick: SSNotify.user1?.nickName,
          group_id: +SSNotify.group?.groupCode,
          message: SSNotify?.postscript,
          group_name: SSNotify.group?.groupName,
          checked: SSNotify.status !== GroupNotifyMsgStatus.KUNHANDLE,
          actor: actorUin,
          requester_nick: SSNotify.user1?.nickName,
        });
      });

    await Promise.all(notifyPromises);

    return retData;
  }
}
