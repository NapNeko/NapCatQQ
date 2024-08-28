import {
    BuddyReqType,
    ChatType,
    FileElement,
    FriendRequest,
    GrayTipElement,
    GroupNotify,
    RawMessage,
    SendStatusType,
} from '@/core/entities';
import { NodeIKernelBuddyListener, NodeIKernelMsgListener } from '@/core/listeners';
import EventEmitter from 'node:events';
import TypedEmitter from 'typed-emitter/rxjs';
import { NapCatCore } from '@/core/index';
import { LRUCache } from '@/common/lru-cache';
import { proxiedListenerOf } from '@/common/proxy-handler';

type NapCatInternalEvents = {
    'message/receive': (msg: RawMessage) => PromiseLike<void>;

    'message/send': (msg: RawMessage) => PromiseLike<void>;


    'buddy/request': (request: FriendRequest) => PromiseLike<void>;

    'buddy/add': (uin: string,
                  xMsg: RawMessage) => PromiseLike<void>;

    'buddy/poke': (initiatorUin: string, targetUin: string, displayMsg: string,
                   xMsg: RawMessage) => PromiseLike<void>;

    'buddy/recall': (uin: string, messageId: string, msg: RawMessage) => PromiseLike<void>;

    'buddy/input-status': (data: Parameters<NodeIKernelMsgListener['onInputStatusPush']>[0]) => PromiseLike<void>;


    'group/request': (request: GroupNotify) => PromiseLike<void>;

    'group/admin': (groupCode: string, targetUin: string, operation: 'set' | 'unset',
                    // If it comes from onMemberInfoChange
                    xDataSource?: RawMessage, xMsg?: RawMessage,
                    // If it comes from onGroupNotifiesUpdated
                    xGroupNotify?: GroupNotify) => PromiseLike<void>;

    'group/mute': (groupCode: string, targetUin: string, duration: number, operation: 'mute' | 'unmute',
                   xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/card-change': (groupCode: string, changedUin: string, newCard: string, oldCard: string,
                          xMsg: RawMessage) => PromiseLike<void>;

    'group/member-increase': (groupCode: string, targetUin: string, operatorUin: string, reason: 'invite' | 'approve' | 'unknown',
                              xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/member-decrease': (groupCode: string, targetUin: string, operatorUin: string, reason: 'leave' | 'kick' | 'unknown',
                              xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/essence': (groupCode: string, messageId: string, senderUin: string, operation: 'add' | 'delete',
                      xGrayTipElement: GrayTipElement,
                      xGrayTipSourceMsg: RawMessage /* this is not the message that is set to be essence msg */) => PromiseLike<void>;

    'group/recall': (groupCode: string, operatorUin: string, messageId: string,
                     xGrayTipSourceMsg: RawMessage /* This is not the message that is recalled */) => PromiseLike<void>;

    'group/title': (groupCode: string, targetUin: string, newTitle: string,
                    xMsg: RawMessage) => PromiseLike<void>;

    'group/upload': (groupCode: string, uploaderUin: string, fileElement: FileElement,
                     xMsg: RawMessage) => PromiseLike<void>;

    'group/emoji-like': (groupCode: string, operatorUin: string, messageId: string, likes: { emojiId: string, count: number }[],
                         // If it comes from onRecvMsg
                         xGrayTipElement?: GrayTipElement, xMsg?: RawMessage,
                         // If it comes from onRecvSysMsg
                         xSysMsg?: number[]) => PromiseLike<void>;

    'group/poke': (groupCode: string, initiatorUin: string, targetUin: string, displayMsg: string,
                   xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;
}

export class NapCatEventChannel extends
    // eslint-disable-next-line
    // @ts-ignore
    (EventEmitter as new () => TypedEmitter<NapCatInternalEvents>) {

    constructor(public core: NapCatCore) {
        super();

        this.initMsgListener();
    }

    private initMsgListener() {
        const msgListener = new NodeIKernelMsgListener();

        msgListener.onRecvMsg = msgList => {
            for (const msg of msgList) {
                if (msg.senderUin !== this.core.selfInfo.uin) {
                    this.emit('message/receive', msg);
                }
            }
        };

        const msgIdSentCache = new LRUCache<string, boolean>(100);
        const recallMsgCache = new LRUCache<string, boolean>(100);
        msgListener.onMsgInfoListUpdate = async msgList => {
            for (const msg of msgList) {
                // Handle message recall
                if (msg.recallTime !== '0' && !recallMsgCache.get(msg.msgId)) {
                    recallMsgCache.put(msg.msgId, true);
                    if (msg.chatType === ChatType.KCHATTYPEC2C) {
                        this.emit('buddy/recall', msg.peerUin, msg.msgId, msg);
                    } else if (msg.chatType == ChatType.KCHATTYPEGROUP) {
                        let operatorId = msg.senderUin;
                        for (const element of msg.elements) {
                            const operatorUid = element.grayTipElement?.revokeElement.operatorUid;
                            if (!operatorUid) return;
                            const operator = await this.core.apis.GroupApi.getGroupMember(msg.peerUin, operatorUid);
                            operatorId = operator?.uin || msg.senderUin;
                        }
                        this.emit('group/recall', msg.peerUin, operatorId, msg.msgId, msg);
                    }
                }

                // Handle message send
                if (msg.sendStatus === SendStatusType.KSEND_STATUS_SUCCESS && !msgIdSentCache.get(msg.msgId)) {
                    msgIdSentCache.put(msg.msgId, true);
                    this.emit('message/send', msg);
                }
            }
        };

        this.core.context.session.getMsgService().addKernelMsgListener(
            proxiedListenerOf(msgListener, this.core.context.logger) as any,
        );
    }
}
