import { ChatType, Peer } from '@/core/entities';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQFriendApi, NTQQMsgApi, NTQQUserApi } from '@/core/apis';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
  type: 'object',
  properties: {
    user_id: { type: ['number', 'string'] },
    group_id: { type: ['number', 'string'] }
  }
} as const satisfies JSONSchema;

type PlayloadType = FromSchema<typeof SchemaData>;

class MarkMsgAsRead extends BaseAction<PlayloadType, null> {
  async getPeer(payload: PlayloadType): Promise<Peer> {
    if (payload.user_id) {
      const peerUid = await NTQQUserApi.getUidByUin(payload.user_id.toString());
      if (!peerUid) {
        throw `私聊${payload.user_id}不存在`;
      }
      const isBuddy = await NTQQFriendApi.isBuddy(peerUid);
      return { chatType: isBuddy ? ChatType.friend : ChatType.temp, peerUid };
    }
    if (!payload.group_id) {
      throw '缺少参数 group_id 或 user_id';
    }
    return { chatType: ChatType.group, peerUid: payload.group_id.toString() };
  }
  protected async _handle(payload: PlayloadType): Promise<null> {
    // 调用API
    const ret = await NTQQMsgApi.setMsgRead(await this.getPeer(payload));
    if (ret.result != 0) {
      throw ('设置已读失败,' + ret.errMsg);
    }
    return null;
  }
}
// 以下为非标准实现
export class MarkPrivateMsgAsRead extends MarkMsgAsRead {
  PayloadSchema = SchemaData;
  actionName = ActionName.MarkPrivateMsgAsRead;
}
export class MarkGroupMsgAsRead extends MarkMsgAsRead {
  PayloadSchema = SchemaData;
  actionName = ActionName.MarkGroupMsgAsRead;
}


interface Payload {
  message_id: number
}

export class GoCQHTTPMarkMsgAsRead extends BaseAction<Payload, null> {
  actionName = ActionName.GoCQHTTP_MarkMsgAsRead;

  protected async _handle(payload: Payload): Promise<null> {
    return null;
  }
}
