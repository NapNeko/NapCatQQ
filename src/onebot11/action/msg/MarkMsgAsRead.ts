import { ChatType, Peer, RawMessage, SendMessageElement } from '@/core/qqnt/entities';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQMsgApi } from '@/core/qqnt/apis';
import { getFriend, getUidByUin } from '@/common/data';

interface Payload {
  uin: string,
}

class MarkMsgAsRead extends BaseAction<Payload, null> {
  ReqChatType = 0;
  protected async _handle(payload: Payload): Promise<null> {
    let uid: string | undefined = payload.uin;
    if (this.ReqChatType != ChatType.group) {
      uid = getUidByUin(payload.uin.toString());
      if (!uid) {
        throw `记录${payload.uin}不存在`;
      }
      const friend = await getFriend(uid);
      this.ReqChatType = friend ? ChatType.friend : ChatType.temp;//重写
    }
    // 获取UID 组装Peer
    // GuildId: string 留空
    const ReqPeer: Peer = { chatType: this.ReqChatType, peerUid: uid, guildId: '' };
    // 调用API
    const ret = await NTQQMsgApi.setMsgRead(ReqPeer);
    if (ret.result != 0) {
      throw ('设置已读失败');
    }
    return null;
  }
}
export class MarkPrivateMsgAsRead extends MarkMsgAsRead {
  actionName = ActionName.MarkPrivateMsgAsRead;
  ReqChatType = ChatType.friend;
}
export class MarkGroupMsgAsRead extends MarkMsgAsRead {
  actionName = ActionName.MarkGroupMsgAsRead;
  ReqChatType = ChatType.group;
}