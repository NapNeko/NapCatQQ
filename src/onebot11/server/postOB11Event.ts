import { OB11Message, OB11MessageAt, OB11MessageData } from '../types';
import { OB11BaseMetaEvent } from '../event/meta/OB11BaseMetaEvent';
import { OB11BaseNoticeEvent } from '../event/notice/OB11BaseNoticeEvent';
import { WebSocket as WebSocketClass } from 'ws';
import { wsReply } from './ws/reply';
import { logDebug, logError } from '@/common/utils/log';
import { ob11Config } from '@/onebot11/config';
import crypto from 'crypto';
import { ChatType, Group, GroupRequestOperateTypes, Peer } from '@/core/entities';
import { normalize, createSendElements, sendMsg } from '../action/msg/SendMsg';
import { OB11FriendRequestEvent } from '../event/request/OB11FriendRequest';
import { OB11GroupRequestEvent } from '../event/request/OB11GroupRequest';
import { isNull } from '@/common/utils/helper';
import { dbUtil } from '@/core/utils/db';
import { friendRequests, getGroup, groupNotifies, selfInfo } from '@/core/data';
import { NTQQFriendApi, NTQQGroupApi, NTQQMsgApi } from '@/core/apis';

export type PostEventType = OB11Message | OB11BaseMetaEvent | OB11BaseNoticeEvent

interface QuickActionPrivateMessage {
  reply?: string;
  auto_escape?: boolean;
}

interface QuickActionGroupMessage extends QuickActionPrivateMessage {
  // 回复群消息
  at_sender?: boolean;
  delete?: boolean;
  kick?: boolean;
  ban?: boolean;
  ban_duration?: number;
  //
}

interface QuickActionFriendRequest {
  approve?: boolean;
  remark?: string;
}

interface QuickActionGroupRequest {
  approve?: boolean;
  reason?: string;
}

type QuickAction =
  QuickActionPrivateMessage
  & QuickActionGroupMessage
  & QuickActionFriendRequest
  & QuickActionGroupRequest

const eventWSList: WebSocketClass[] = [];

export function registerWsEventSender(ws: WebSocketClass) {
  eventWSList.push(ws);
}

export function unregisterWsEventSender(ws: WebSocketClass) {
  const index = eventWSList.indexOf(ws);
  if (index !== -1) {
    eventWSList.splice(index, 1);
  }
}

export function postWsEvent(event: PostEventType) {
  for (const ws of eventWSList) {
    new Promise(() => {
      wsReply(ws, event);
    }).then();
  }
}

export function postOB11Event(msg: PostEventType, reportSelf = false, postWs = true) {
  const config = ob11Config;

  // 判断msg是否是event
  if (!config.reportSelfMessage && !reportSelf) {
    if (msg.post_type === 'message' && (msg as OB11Message).user_id.toString() == selfInfo.uin) {
      return;
    }
  }
  if (config.http.enablePost) {
    const msgStr = JSON.stringify(msg);
    const hmac = crypto.createHmac('sha1', ob11Config.http.secret);
    hmac.update(msgStr);
    const sig = hmac.digest('hex');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-self-id': selfInfo.uin
    };
    if (config.http.secret) {
      headers['x-signature'] = 'sha1=' + sig;
    }
    for (const host of config.http.postUrls) {
      fetch(host, {
        method: 'POST',
        headers,
        body: msgStr
      }).then(async (res) => {
        logDebug(`新消息事件HTTP上报成功: ${host} `, msgStr);
        // todo: 处理不够优雅，应该使用高级泛型进行QuickAction类型识别
        let resJson: QuickAction;
        try {
          resJson = await res.json();
          logDebug('新消息事件HTTP上报返回快速操作: ', JSON.stringify(resJson));
        } catch (e) {
          logDebug('新消息事件HTTP上报没有返回快速操作，不需要处理');
          return;
        }
        if (msg.post_type === 'message') {
          msg = msg as OB11Message;
          const rawMessage = await dbUtil.getMsgByShortId(msg.message_id);
          resJson = resJson as QuickActionPrivateMessage | QuickActionGroupMessage;
          const reply = resJson.reply;
          const peer: Peer = {
            chatType: ChatType.friend,
            peerUid: msg.user_id.toString()
          };
          if (msg.message_type == 'private') {
            if (msg.sub_type === 'group') {
              peer.chatType = ChatType.temp;
            }
          } else {
            peer.chatType = ChatType.group;
            peer.peerUid = msg.group_id!.toString();
          }
          if (reply) {
            let group: Group | undefined;
            let replyMessage: OB11MessageData[] = [];

            if (msg.message_type == 'group') {
              group = await getGroup(msg.group_id!.toString());
              if ((resJson as QuickActionGroupMessage).at_sender) {
                replyMessage.push({
                  type: 'at',
                  data: {
                    qq: msg.user_id.toString()
                  }
                } as OB11MessageAt);
              }
            }
            replyMessage = replyMessage.concat(normalize(reply, resJson.auto_escape));
            const { sendElements, deleteAfterSentFiles } = await createSendElements(replyMessage, group);
            sendMsg(peer, sendElements, deleteAfterSentFiles, false).then();
          } else if (resJson.delete) {
            NTQQMsgApi.recallMsg(peer, [rawMessage!.msgId]).then();
          } else if (resJson.kick) {
            NTQQGroupApi.kickMember(peer.peerUid, [rawMessage!.senderUid]).then();
          } else if (resJson.ban) {
            NTQQGroupApi.banMember(peer.peerUid, [{
              uid: rawMessage!.senderUid,
              timeStamp: resJson.ban_duration || 60 * 30
            }],).then();
          }

        } else if (msg.post_type === 'request') {
          if ((msg as OB11FriendRequestEvent).request_type === 'friend') {
            resJson = resJson as QuickActionFriendRequest;
            if (!isNull(resJson.approve)) {
              // todo: set remark
              const flag = (msg as OB11FriendRequestEvent).flag;
              // const [friendUid, seq] = flag.split('|');
              const request = friendRequests[flag];
              NTQQFriendApi.handleFriendRequest(
                request,
                !!resJson.approve,
              ).then();
            }
          } else if ((msg as OB11GroupRequestEvent).request_type === 'group') {
            resJson = resJson as QuickActionGroupRequest;
            if (!isNull(resJson.approve)) {
              const flag = (msg as OB11GroupRequestEvent).flag;
              const request = groupNotifies[flag];
              // const [groupCode, seq] = flag.split('|');
              NTQQGroupApi.handleGroupRequest(request,
                resJson.approve ? GroupRequestOperateTypes.approve : GroupRequestOperateTypes.reject
              ).then();
            }
          }
        }
      }, (err: any) => {
        logError(`新消息事件HTTP上报失败: ${host} `, err, msg);
      });
    }
  }
  if (postWs) {
    postWsEvent(msg);
  }
}
