import BaseAction from '../BaseAction';
import { NTQQMsgApi } from '@/core/apis';
import { ChatType, Peer } from '@/core/entities';
import { dbUtil } from '@/common/utils/db';
import { getUidByUin } from '@/core/data';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
  type: 'object',
  properties: {
    message_id: { type: 'number' },
    group_id: { type: [ 'number' , 'string' ] },
    user_id: { type: [ 'number' , 'string' ] }
  },
  required: ['message_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class ForwardSingleMsg extends BaseAction<Payload, null> {
  protected async getTargetPeer(payload: Payload): Promise<Peer> {
    if (payload.user_id) {
      const peerUid = getUidByUin(payload.user_id.toString());
      if (!peerUid) {
        throw new Error(`无法找到私聊对象${payload.user_id}`);
      }
      return { chatType: ChatType.friend, peerUid };
    }
    return { chatType: ChatType.group, peerUid: payload.group_id!.toString() };
  }

  protected async _handle(payload: Payload): Promise<null> {
    const msg = await dbUtil.getMsgByShortId(payload.message_id);
    if (!msg) {
      throw new Error(`无法找到消息${payload.message_id}`);
    }
    const peer = await this.getTargetPeer(payload);
    const ret = await NTQQMsgApi.forwardMsg(
      {
        chatType: msg.chatType,
        peerUid: msg.peerUid,
      },
      peer,
      [msg.msgId],
    );
    if (ret.result !== 0) {
      throw new Error(`转发消息失败 ${ret.errMsg}`);
    }
    return null;
  }
}

export class ForwardFriendSingleMsg extends ForwardSingleMsg {
  PayloadSchema = SchemaData;
  actionName = ActionName.ForwardFriendSingleMsg;
}

export class ForwardGroupSingleMsg extends ForwardSingleMsg {
  PayloadSchema = SchemaData;
  actionName = ActionName.ForwardGroupSingleMsg;
}
