import BaseAction from '../BaseAction';
import { getGroup } from '@/core/data';
import { ActionName } from '../types';
import { SendMsgElementConstructor } from '@/core/entities/constructor';
import { ChatType, Peer, SendFileElement } from '@/core/entities';
import fs from 'fs';
import { SendMsg, sendMsg } from '@/onebot11/action/msg/SendMsg';
import { uri2local } from '@/common/utils/file';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { NTQQFriendApi, NTQQUserApi } from '@/core';
const SchemaData = {
  type: 'object',
  properties: {
    user_id: { type: ['number', 'string'] },
    file: { type: 'string' },
    name: { type: 'string' }
  },
  required: ['user_id', 'file', 'name']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class GoCQHTTPUploadPrivateFile extends BaseAction<Payload, null> {
  actionName = ActionName.GOCQHTTP_UploadPrivateFile;
  PayloadSchema = SchemaData;
  async getPeer(payload: Payload): Promise<Peer> {
    if (payload.user_id) {
      const peerUid = await NTQQUserApi.getUidByUin(payload.user_id.toString());
      if (!peerUid) {
        throw `私聊${payload.user_id}不存在`;
      }
      const isBuddy = await NTQQFriendApi.isBuddy(peerUid);
      return { chatType: isBuddy ? ChatType.friend : ChatType.temp, peerUid };
    }
    throw '缺少参数 user_id';
  }
  protected async _handle(payload: Payload): Promise<null> {
    const peer = await this.getPeer(payload);
    let file = payload.file;
    if (fs.existsSync(file)) {
      file = `file://${file}`;
    }
    const downloadResult = await uri2local(file);
    if (!downloadResult.success) {
      throw new Error(downloadResult.errMsg);
    }
    const sendFileEle: SendFileElement = await SendMsgElementConstructor.file(downloadResult.path, payload.name);
    await sendMsg(peer, [sendFileEle], [], true);
    return null;
  }
}
