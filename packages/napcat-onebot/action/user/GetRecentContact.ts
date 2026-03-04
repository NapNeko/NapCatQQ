import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';
import { Static, Type } from '@sinclair/typebox';

export const GetRecentContactPayloadSchema = Type.Object({
  count: Type.Union([Type.Number(), Type.String()], { default: 10, description: '获取的数量' }),
});

export type GetRecentContactPayload = Static<typeof GetRecentContactPayloadSchema>;

export const GetRecentContactReturnSchema = Type.Array(Type.Object({
  lastestMsg: Type.Any({ description: '最后一条消息' }),
  peerUin: Type.String({ description: '对象QQ' }),
  remark: Type.String({ description: '备注' }),
  msgTime: Type.String({ description: '消息时间' }),
  chatType: Type.Number({ description: '聊天类型' }),
  msgId: Type.String({ description: '消息ID' }),
  sendNickName: Type.String({ description: '发送者昵称' }),
  sendMemberName: Type.String({ description: '发送者群名片' }),
  peerName: Type.String({ description: '对象名称' }),
}), { description: '最近会话列表' });

export type GetRecentContactReturn = Static<typeof GetRecentContactReturnSchema>;

export default class GetRecentContact extends OneBotAction<GetRecentContactPayload, GetRecentContactReturn> {
  override actionName = ActionName.GetRecentContact;
  override payloadSchema = GetRecentContactPayloadSchema;
  override returnSchema = GetRecentContactReturnSchema;
  override actionSummary = '获取最近会话';
  override actionDescription = '获取最近会话';
  override actionTags = ['用户接口'];
  override payloadExample = {
    count: 10
  };
  override returnExample = [
    {
      peerUin: '123456',
      peerName: '测试',
      msgTime: '1734567890',
      msgId: '12345',
      lastestMsg: {}
    }
  ];

  async _handle (payload: GetRecentContactPayload, _adapter: string, config: NetworkAdapterConfig): Promise<GetRecentContactReturn> {
    const ret = await this.core.apis.UserApi.getRecentContactListSnapShot(+payload.count);
    // 烘焙消息
    const results = await Promise.all(ret.info.changedList.map(async (t) => {
      const FastMsg = await this.core.apis.MsgApi.getMsgsByMsgId({ chatType: t.chatType, peerUid: t.peerUid }, [t.msgId]);
      if (FastMsg.msgList.length > 0 && FastMsg.msgList[0]) {
        // 扩展ret.info.changedList
        const lastestMsg = await this.obContext.apis.MsgApi.parseMessage(FastMsg.msgList[0], config.messagePostFormat);
        return {
          lastestMsg,
          peerUin: t.peerUin,
          remark: String(t.remark ?? ''),
          msgTime: t.msgTime,
          chatType: t.chatType,
          msgId: t.msgId,
          sendNickName: String(t.sendNickName ?? ''),
          sendMemberName: String(t.sendMemberName ?? ''),
          peerName: String(t.peerName ?? ''),
        };
      }
      return {
        lastestMsg: undefined,
        peerUin: t.peerUin,
        remark: String(t.remark ?? ''),
        msgTime: t.msgTime,
        chatType: t.chatType,
        msgId: t.msgId,
        sendNickName: String(t.sendNickName ?? ''),
        sendMemberName: String(t.sendMemberName ?? ''),
        peerName: String(t.peerName ?? ''),
      };
    }));
    return results;
  }
}
