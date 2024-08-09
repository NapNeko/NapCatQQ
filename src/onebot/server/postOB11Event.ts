import { OB11Message, OB11MessageAt, OB11MessageData, OB11MessageReply } from '../types';
import { OB11BaseMetaEvent } from '../event/meta/OB11BaseMetaEvent';
import { OB11BaseNoticeEvent } from '../event/notice/OB11BaseNoticeEvent';
import { WebSocket as WebSocketClass } from 'ws';
import { wsReply } from './ws/reply';
import crypto from 'crypto';
import { ChatType, Group, GroupRequestOperateTypes, Peer } from '@/core/entities';
import { normalize, sendMsg } from '../action/msg/SendMsg';
import { OB11FriendRequestEvent } from '../event/request/OB11FriendRequest';
import { OB11GroupRequestEvent } from '../event/request/OB11GroupRequest';
import { isNull } from '@/common/utils/helper';
import createSendElements from '../action/msg/SendMsg/create-send-elements';
import { NapCatCore } from '@/core';

export type QuickActionEvent = OB11Message | OB11BaseMetaEvent | OB11BaseNoticeEvent
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

export type QuickAction =
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

export function postWsEvent(event: QuickActionEvent) {
    for (const ws of eventWSList) {
        new Promise(() => {
            wsReply(ws, event);
        }).then();
    }
}

export function postOB11Event(
    msg: QuickActionEvent,
    reportSelf = false,
    postWs = true,
    enablePost = true,
    httpSecret: string | undefined = undefined,
    coreContext: NapCatCore,
    HttpPostUrl: string[]
) {
    // 判断msg是否是event
    if (!reportSelf) {
        if (msg.post_type === 'message' && (msg as OB11Message).user_id.toString() == coreContext.selfInfo.uin) {
            return;
        }
    }
    if (enablePost) {
        const msgStr = JSON.stringify(msg);
        const hmac = crypto.createHmac('sha1', (httpSecret || "").toString());
        hmac.update(msgStr);
        const sig = hmac.digest('hex');
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-self-id': coreContext.selfInfo.uin
        };
        if (httpSecret) {
            headers['x-signature'] = 'sha1=' + sig;
        }
        for (const host of HttpPostUrl) {
            fetch(host, {
                method: 'POST',
                headers,
                body: msgStr
            }).then(async (res) => {
                //logDebug(`新消息事件HTTP上报成功: ${host} `, msgStr);
                // todo: 处理不够优雅，应该使用高级泛型进行QuickAction类型识别
                let resJson: QuickAction;
                try {
                    resJson = await res.json();
                    //logDebug('新消息事件HTTP上报返回快速操作: ', JSON.stringify(resJson));
                } catch (e) {
                    coreContext.context.logger.logDebug('新消息事件HTTP上报没有返回快速操作，不需要处理');
                    return;
                }
                try {
                    handleQuickOperation(msg as QuickActionEvent, resJson, coreContext).then().catch(coreContext.context.logger.logError);
                } catch (e: any) {
                    coreContext.context.logger.logError('新消息事件HTTP上报返回快速操作失败', e);
                }

            }, (err: any) => {
                coreContext.context.logger.logError(`新消息事件HTTP上报失败: ${host} `, err, msg);
            });
        }
    }
    if (postWs) {
        postWsEvent(msg);
    }
}
async function handleMsg(msg: OB11Message, quickAction: QuickAction, coreContext: NapCatCore) {
    const NTQQUserApi = coreContext.getApiContext().UserApi;
    msg = msg as OB11Message;
    const reply = quickAction.reply;
    const peer: Peer = {
        chatType: ChatType.friend,
        peerUid: await NTQQUserApi.getUidByUin(msg.user_id.toString()) as string
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
        let group: string | undefined;
        let replyMessage: OB11MessageData[] = [];

        if (msg.message_type == 'group') {
            group = msg.group_id!.toString();
            replyMessage.push({
                type: 'reply',
                data: {
                    id: msg.message_id.toString()
                }
            } as OB11MessageReply);
            if ((quickAction as QuickActionGroupMessage).at_sender) {
                replyMessage.push({
                    type: 'at',
                    data: {
                        qq: msg.user_id.toString()
                    }
                } as OB11MessageAt);
            }
        }
        replyMessage = replyMessage.concat(normalize(reply, quickAction.auto_escape));
        const { sendElements, deleteAfterSentFiles } = await createSendElements(coreContext, replyMessage, peer);
        sendMsg(coreContext, peer, sendElements, deleteAfterSentFiles, false).then().catch(coreContext.context.logger.logError);
    }
}
async function handleGroupRequest(request: OB11GroupRequestEvent, quickAction: QuickActionGroupRequest, coreContext: NapCatCore) {
    const NTQQGroupApi = coreContext.getApiContext().GroupApi;
    if (!isNull(quickAction.approve)) {
        NTQQGroupApi.handleGroupRequest(
            request.flag,
            quickAction.approve ? GroupRequestOperateTypes.approve : GroupRequestOperateTypes.reject,
            quickAction.reason,
        ).then().catch(coreContext.context.logger.logError);
    }
}
async function handleFriendRequest(request: OB11FriendRequestEvent, quickAction: QuickActionFriendRequest, coreContext: NapCatCore) {
    const NTQQFriendApi = coreContext.getApiContext().FriendApi;
    if (!isNull(quickAction.approve)) {
        NTQQFriendApi.handleFriendRequest(request.flag, !!quickAction.approve).then().catch(coreContext.context.logger.logError);
    }
}
export async function handleQuickOperation(context: QuickActionEvent, quickAction: QuickAction, coreContext: NapCatCore) {
    if (context.post_type === 'message') {
        handleMsg(context as OB11Message, quickAction, coreContext).then().catch(coreContext.context.logger.logError);
    }
    if (context.post_type === 'request') {
        const friendRequest = context as OB11FriendRequestEvent;
        const groupRequest = context as OB11GroupRequestEvent;
        if ((friendRequest).request_type === 'friend') {
            handleFriendRequest(friendRequest, quickAction, coreContext).then().catch(coreContext.context.logger.logError);
        }
        else if (groupRequest.request_type === 'group') {
            handleGroupRequest(groupRequest, quickAction, coreContext).then().catch(coreContext.context.logger.logError);
        }
    }
}