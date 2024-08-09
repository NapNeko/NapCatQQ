
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { OB11Constructor } from '@/onebot/helper/data';

const SchemaData = {
  type: 'object',
  properties: {
    count: { type: ['number', 'string'] }
  }
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class GetRecentContact extends BaseAction<Payload, any> {
  actionName = ActionName.GetRecentContact;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    const NTQQUserApi = this.CoreContext.getApiContext().UserApi;
    const NTQQMsgApi = this.CoreContext.getApiContext().MsgApi;
    const ret = await NTQQUserApi.getRecentContactListSnapShot(parseInt((payload.count || 10).toString()));
    const data = await Promise.all(ret.info.changedList.map(async (t) => {
      const FastMsg = await NTQQMsgApi.getMsgsByMsgId({ chatType: t.chatType, peerUid: t.peerUid }, [t.msgId]);
      if (FastMsg.msgList.length > 0) {
        //扩展ret.info.changedList
        const lastestMsg = await OB11Constructor.message(this.CoreContext, FastMsg.msgList[0], "array");
        return {
          lastestMsg: lastestMsg,
          peerUin: t.peerUin,
          remark: t.remark,
          msgTime: t.msgTime,
          chatType: t.chatType,
          msgId: t.msgId,
          sendNickName: t.sendNickName,
          sendMemberName: t.sendMemberName,
          peerName: t.peerName
        };
      }
      return {
        peerUin: t.peerUin,
        remark: t.remark,
        msgTime: t.msgTime,
        chatType: t.chatType,
        msgId: t.msgId,
        sendNickName: t.sendNickName,
        sendMemberName: t.sendMemberName,
        peerName: t.peerName
      };
    }));
    return data;
  }
}
