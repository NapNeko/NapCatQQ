import BaseAction from '../BaseAction';
import { OB11Message, OB11User } from '../../types';
import { ActionName } from '../types';
import { ChatType } from '@/core/entities';
import { dbUtil } from '@/common/utils/db';
import { NTQQMsgApi } from '@/core/apis/msg';
import { OB11Constructor } from '../../constructor';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { NTQQGroupApi } from '@/core';
interface Response {
  messages: OB11Message[];
}

const SchemaData = {
  type: 'object',
  properties: {
    group_id: { type: [ 'number' , 'string' ] },
    message_seq: { type: 'number' },
    count: { type: 'number' }
  },
  required: ['group_id', 'message_seq', 'count']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class GoCQHTTPGetGroupMsgHistory extends BaseAction<Payload, Response> {
  actionName = ActionName.GoCQHTTP_GetGroupMsgHistory;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload): Promise<Response> {
    const group =  (await NTQQGroupApi.getGroups()).find(e => e.groupCode == payload.group_id?.toString());
    if (!group) {
      throw `群${payload.group_id}不存在`;
    }
    const startMsgId = (await dbUtil.getMsgByShortId(payload.message_seq))?.msgId || '0';
    // log("startMsgId", startMsgId)
    const historyResult = (await NTQQMsgApi.getMsgHistory({
      chatType: ChatType.group,
      peerUid: group.groupCode
    }, startMsgId, parseInt(payload.count?.toString()) || 20));
    //logDebug(historyResult);
    const msgList = historyResult.msgList;
    await Promise.all(msgList.map(async msg => {
      msg.id = await dbUtil.addMsg(msg);
    }));
    const ob11MsgList = await Promise.all(msgList.map(msg => OB11Constructor.message(msg)));
    return { 'messages': ob11MsgList };
  }
}
