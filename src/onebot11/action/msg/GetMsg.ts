import { OB11Message } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { MessageUnique } from '@/common/utils/MessageUnique';
import { NTQQMsgApi } from '@/core';


export type ReturnDataType = OB11Message

const SchemaData = {
  type: 'object',
  properties: {
    message_id: { type: ['number', 'string'] },
  },
  required: ['message_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class GetMsg extends BaseAction<Payload, OB11Message> {
  actionName = ActionName.GetMsg;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    // log("history msg ids", Object.keys(msgHistory));
    if (!payload.message_id) {
      throw Error('参数message_id不能为空');
    }
    const MsgShortId = await MessageUnique.getShortIdByMsgId(payload.message_id.toString());
    const msgIdWithPeer = await MessageUnique.getMsgIdAndPeerByShortId(MsgShortId || parseInt(payload.message_id.toString()));
    if (!msgIdWithPeer) {
      throw ('消息不存在');
    }
    const peer = { guildId: '', peerUid: msgIdWithPeer?.Peer.peerUid, chatType: msgIdWithPeer.Peer.chatType };
    const msg = await NTQQMsgApi.getMsgsByMsgId(
      peer,
      [msgIdWithPeer?.MsgId || payload.message_id.toString()]);
    let retMsg = await OB11Constructor.message(msg.msgList[0]);
    try {
      retMsg.message_id = MessageUnique.createMsg(peer, msg.msgList[0].msgId)!;
      retMsg.message_seq = retMsg.message_id;
      retMsg.real_id = retMsg.message_id;
    } catch (e) {
    }
    return retMsg;
  }
}

export default GetMsg;
