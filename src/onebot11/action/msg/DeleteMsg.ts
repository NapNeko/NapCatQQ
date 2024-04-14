import { NTQQMsgApi } from '@/core/qqnt/apis';
import { ActionName } from '../types';
import BaseAction from '../BaseAction';
import { dbUtil } from '@/common/utils/db';
import { napCatCore } from '@/core';

interface Payload {
  message_id: number
}

class DeleteMsg extends BaseAction<Payload, void> {
  actionName = ActionName.DeleteMsg;

  protected async _handle(payload: Payload) {
    const msg = await dbUtil.getMsgByShortId(payload.message_id);
    if (msg) {
      await NTQQMsgApi.recallMsg({ peerUid: msg.peerUid, chatType: msg.chatType }, [msg.msgId]);
    }
  }
}

export default DeleteMsg;
