import BaseAction from '../BaseAction';
import { OB11ForwardMessage, OB11Message, OB11MessageData } from '../../types';
import { NTQQMsgApi } from '@/core/apis';
import { OB11Constructor } from '../../constructor';
import { ActionName, BaseCheckResult } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/utils/MessageUnique';

const SchemaData = {
  type: 'object',
  properties: {
    message_id: { type: 'string' },
    id: { type: 'string' }
  },
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

interface Response {
  messages: (OB11Message & { content: OB11MessageData })[];
}

export class GoCQHTTPGetForwardMsgAction extends BaseAction<Payload, any> {
  actionName = ActionName.GoCQHTTP_GetForwardMsg;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload): Promise<any> {
    const msgIdMixOb11Id = payload.message_id || payload.id;
    if (!msgIdMixOb11Id) {
      throw Error('message_id or id is required');
    }
    const rootMsgId = MessageUnique.getShortIdByMsgId(msgIdMixOb11Id);
    const rootMsg = MessageUnique.getMsgIdAndPeerByShortId(rootMsgId || parseInt(msgIdMixOb11Id));
    if (!rootMsg) {
      throw Error('msg not found');
    }
    const data = await NTQQMsgApi.getMultiMsg(rootMsg.Peer, rootMsg.MsgId, rootMsg.MsgId);
    if (!data || data.result !== 0) {
      throw Error('找不到相关的聊天记录' + data?.errMsg);
    }
    const msgList = data.msgList;
    const messages = await Promise.all(msgList.map(async msg => {
      const resMsg = await OB11Constructor.message(msg);
      resMsg.message_id = MessageUnique.createMsg({ guildId: '', chatType: msg.chatType, peerUid: msg.peerUid }, msg.msgId)!;
      return resMsg;
    }));
    messages.map(msg => {
      (<OB11ForwardMessage>msg).content = msg.message;
      delete (<any>msg).message;
    });
    return { messages };
  }
}
