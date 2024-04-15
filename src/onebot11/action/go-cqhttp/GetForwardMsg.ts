import BaseAction from '../BaseAction';
import { OB11ForwardMessage, OB11Message, OB11MessageData } from '../../types';
import { NTQQMsgApi } from '@/core/qqnt/apis';
import { dbUtil } from '@/common/utils/db';
import { OB11Constructor } from '../../constructor';
import { ActionName } from '../types';

interface Payload {
  message_id: string;  // long msg id
  id?: string;  // short msg id
}

interface Response {
  messages: (OB11Message & { content: OB11MessageData })[];
}

export class GoCQHTTGetForwardMsgAction extends BaseAction<Payload, any> {
  actionName = ActionName.GoCQHTTP_GetForwardMsg;

  protected async _handle(payload: Payload): Promise<any> {
    const rootMsg = await dbUtil.getMsgByLongId( payload.id || payload.message_id);
    if (!rootMsg) {
      throw Error('msg not found');
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
