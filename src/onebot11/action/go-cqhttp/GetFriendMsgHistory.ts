import BaseAction from '../BaseAction';
import { OB11Message, OB11User } from '../../types';
import { ActionName } from '../types';
import { ChatType } from '@/core/entities';
import { NTQQMsgApi } from '@/core/apis/msg';
import { OB11Constructor } from '../../constructor';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { NTQQFriendApi, NTQQUserApi } from '@/core';
import { MessageUnique } from '@/common/utils/MessageUnique';

interface Response {
  messages: OB11Message[];
}

const SchemaData = {
  type: 'object',
  properties: {
    user_id: { type: ['number', 'string'] },
    message_seq: { type: 'number' },
    count: { type: 'number' }
  },
  required: ['user_id', 'message_seq', 'count']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class GetFriendMsgHistory extends BaseAction<Payload, Response> {
  actionName = ActionName.GetFriendMsgHistory;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload): Promise<Response> {
    const uid = await NTQQUserApi.getUidByUin(payload.user_id.toString());
    if (!uid) {
      throw `记录${payload.user_id}不存在`;
    }
    const startMsgId = (await MessageUnique.getMsgIdAndPeerByShortId(payload.message_seq))?.MsgId || '0';
    const friend = await NTQQFriendApi.isBuddy(uid);
    const historyResult = (await NTQQMsgApi.getMsgHistory({
      chatType: friend ? ChatType.friend : ChatType.temp,
      peerUid: uid
    }, startMsgId, parseInt(payload.count?.toString()) || 20));
    //logDebug(historyResult);
    const msgList = historyResult.msgList;
    await Promise.all(msgList.map(async msg => {
      msg.id = await MessageUnique.createMsg({ guildId: '', chatType: msg.chatType, peerUid: msg.peerUid }, msg.msgId);
    }));
    const ob11MsgList = await Promise.all(msgList.map(msg => OB11Constructor.message(msg)));
    return { 'messages': ob11MsgList };
  }
}
