import BaseAction from '../BaseAction';
import { OB11ForwardMessage, OB11Message, OB11MessageData } from '../../types';
import { NTQQMsgApi } from '@/core/apis';
import { dbUtil } from '@/common/utils/db';
import { OB11Constructor } from '../../constructor';
import { ActionName, BaseCheckResult } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import Ajv from 'ajv';

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
    const msgId = payload.message_id || payload.id;
    if (!msgId) {
      throw Error('message_id is required');
    }
    let rootMsg = await dbUtil.getMsgByLongId(msgId);
    if (!rootMsg) {
      rootMsg = await dbUtil.getMsgByShortId(parseInt(msgId));
      if (!rootMsg) {
        throw Error('msg not found');
      }
    }
    const data = await NTQQMsgApi.getMultiMsg({
      chatType: rootMsg.chatType,
      peerUid: rootMsg.peerUid
    }, rootMsg.msgId, rootMsg.msgId);
    if (!data || data.result !== 0) {
      throw Error('找不到相关的聊天记录' + data?.errMsg);
    }
    const msgList = data.msgList;
    const messages = await Promise.all(msgList.map(async msg => {
      const resMsg = await OB11Constructor.message(msg);
      resMsg.message_id = await dbUtil.addMsg(msg);
      return resMsg;
    }));
    messages.map(msg => {
      (<OB11ForwardMessage>msg).content = msg.message;
      delete (<any>msg).message;
    });
    return { messages };
  }
}
