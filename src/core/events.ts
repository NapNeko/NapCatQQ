import {
    BuddyReqType,
    ChatType,
    FileElement,
    FriendRequest,
    GrayTipElement,
    GroupNotify,
    GroupNotifyMsgStatus,
    GroupNotifyMsgType,
    RawMessage,
    SendStatusType,
    TipGroupElement,
} from '@/core/entities';
import { NodeIKernelBuddyListener, NodeIKernelGroupListener, NodeIKernelMsgListener } from '@/core/listeners';
import EventEmitter from 'node:events';
import TypedEmitter from 'typed-emitter/rxjs';
import { NapCatCore } from '@/core/index';
import { LRUCache } from '@/common/lru-cache';
import { proxiedListenerOf } from '@/common/proxy-handler';

type NapCatInternalEvents = {
    'message/receive': (msg: RawMessage) => PromiseLike<void>;

    'message/send': (msg: RawMessage) => PromiseLike<void>;


    'buddy/request': (uid: string, words: string,
                      xRequest: FriendRequest) => PromiseLike<void>;

    'buddy/add': (uin: string,
                  xMsg: RawMessage) => PromiseLike<void>;

    'buddy/poke': (initiatorUin: string, targetUin: string, displayMsg: string,
                   xMsg: RawMessage) => PromiseLike<void>;

    'buddy/recall': (uin: string, messageId: string,
                     xMsg: RawMessage /* This is not the message that is recalled */) => PromiseLike<void>;

    'buddy/input-status': (data: Parameters<NodeIKernelMsgListener['onInputStatusPush']>[0]) => PromiseLike<void>;


    'group/request': (groupCode: string, requestUin: string, words: string,
                      xGroupNotify: GroupNotify) => PromiseLike<void>;

    'group/invite': (groupCode: string, invitorUin: string,
                     xGroupNotify: GroupNotify) => PromiseLike<void>;

    'group/admin': (groupCode: string, targetUin: string, operation: 'set' | 'unset',
                    // If it comes from onGroupNotifiesUpdated
                    xGroupNotify?: GroupNotify,
                    // If it comes from onMemberInfoChange
                    xDataSource?: RawMessage, xMsg?: RawMessage) => PromiseLike<void>;


    'group/mute': (groupCode: string, targetUin: string, duration: number, operation: 'mute' | 'unmute',
                   xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/card-change': (groupCode: string, changedUin: string, newCard: string, oldCard: string,
                          xMsg: RawMessage) => PromiseLike<void>;

    'group/member-increase': (groupCode: string, targetUin: string, operatorUin: string, reason: 'invite' | 'approve' | 'unknown',
                              xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/member-decrease/kicked': (groupCode: string, leftMemberUin: string, operatorUin: string,
                                     xGroupNotify: GroupNotify) => PromiseLike<void>;

    'group/member-decrease/self-kicked': (groupCode: string, operatorUin: string,
                                          xTipGroupElement: TipGroupElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/member-decrease/leave': (groupCode: string, leftMemberUin: string,
                                    xGroupNotify: GroupNotify) => PromiseLike<void>;

    'group/member-decrease/unknown': (groupCode: string, leftMemberUin: string,
                                      // If it comes from onGroupNotifiesUpdated
                                      xGroupNotify?: GroupNotify,
                                      // If it comes from onRecvSysMsg
                                      xGrayTipElement?: GrayTipElement, xMsg?: RawMessage) => PromiseLike<void>;

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
        this.initBuddyListener();
        this.initGroupListener();
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

    private initBuddyListener() {
        const buddyListener = new NodeIKernelBuddyListener();

        buddyListener.onBuddyReqChange = async reqs => {
            await this.core.apis.FriendApi.clearBuddyReqUnreadCnt();
            for (let i = 0; i < reqs.unreadNums; i++) {
                const req = reqs.buddyReqs[i];
                if (!!req.isInitiator || (req.isDecide && req.reqType !== BuddyReqType.KMEINITIATORWAITPEERCONFIRM)) {
                    continue;
                }
                try {
                    const reqUin = await this.core.apis.UserApi.getUinByUidV2(req.friendUid);
                    this.emit('buddy/request', reqUin, req.extWords, req);
                } catch (e) {
                    this.core.context.logger.logDebug('获取加好友者 QQ 号失败', e);
                }
            }
        };

        this.core.context.session.getBuddyService().addKernelBuddyListener(
            proxiedListenerOf(buddyListener, this.core.context.logger) as any,
        );
    }

    private initGroupListener() {
        const groupListener = new NodeIKernelGroupListener();

        groupListener.onGroupNotifiesUpdated = async (_, notifies) => {
            for (const notify of notifies) {
                try {
                    if (notify.type === GroupNotifyMsgType.SET_ADMIN) {
                        this.core.context.logger.logDebug('设置管理员', notify);
                        const member = await this.core.apis.GroupApi.getGroupMember(notify.group.groupCode, notify.user1.uid);
                        this.emit(
                            'group/admin',
                            notify.group.groupCode, member!.uin,
                            'set',
                            notify,
                        );
                        continue;
                    }
                    if (
                        notify.type === GroupNotifyMsgType.CANCEL_ADMIN_NOTIFY_ADMIN ||
                        notify.type === GroupNotifyMsgType.CANCEL_ADMIN_NOTIFY_CANCELED
                    ) {
                        this.core.context.logger.logDebug('取消管理员', notify);
                        const member = await this.core.apis.GroupApi.getGroupMember(notify.group.groupCode, notify.user1.uid);
                        this.emit(
                            'group/admin',
                            notify.group.groupCode, member!.uin,
                            'unset',
                            notify,
                        );
                        continue;
                    }
                } catch (e) {
                    this.core.context.logger.logError('处理群管理员变动失败', e);
                }

                try {
                    if (notify.type === GroupNotifyMsgType.MEMBER_LEAVE_NOTIFY_ADMIN) {
                        this.core.context.logger.logDebug('群成员离开', notify);
                        const leftMemberUin = await this.core.apis.UserApi.getUinByUidV2(notify.user1.uid);
                        if (notify.user2.uid) {
                            // Has an operator, indicates that the member is kicked
                            const operatorUin = await this.core.apis.UserApi.getUinByUidV2(notify.user2.uid);
                            if (!operatorUin) {
                                this.core.context.logger.logError('获取操作者 QQ 号失败');
                                this.emit(
                                    'group/member-decrease/unknown',
                                    notify.group.groupCode,
                                    leftMemberUin,
                                    notify,
                                );
                                continue;
                            }
                            this.emit(
                                'group/member-decrease/kicked',
                                notify.group.groupCode,
                                leftMemberUin,
                                operatorUin,
                                notify
                            );
                            continue;
                        } else {
                            // No operator, indicates that the member leaves
                            this.emit(
                                'group/member-decrease/leave',
                                notify.group.groupCode,
                                leftMemberUin,
                                notify
                            );
                            continue;
                        }
                    }
                } catch (e) {
                    this.core.context.logger.logError('处理退群消息失败', e);
                }

                try {
                    if (
                        notify.type === GroupNotifyMsgType.REQUEST_JOIN_NEED_ADMINI_STRATOR_PASS &&
                        notify.status === GroupNotifyMsgStatus.KUNHANDLE
                    ) {
                        this.core.context.logger.logDebug('入群请求', notify);
                        const requesterUin = await this.core.apis.UserApi.getUinByUidV2(notify.user1.uid);
                        this.emit(
                            'group/request',
                            notify.group.groupCode,
                            requesterUin,
                            notify.postscript,
                            notify
                        );
                        continue;
                    }
                } catch (e) {
                    this.core.context.logger.logError('处理入群请求失败', e);
                }

                try {
                    // Todo: unstable, may need to be in sync with main branch
                    if (
                        notify.type == GroupNotifyMsgType.INVITED_BY_MEMBER &&
                        notify.status == GroupNotifyMsgStatus.KUNHANDLE
                    ) {
                        this.core.context.logger.logDebug('入群邀请', notify);
                        const requesterUin = await this.core.apis.UserApi.getUinByUidV2(notify.user1.uid);
                        this.emit(
                            'group/invite',
                            notify.group.groupCode,
                            requesterUin,
                            notify
                        );
                        // continue;
                    }
                } catch (e) {
                    this.core.context.logger.logError('处理入群邀请失败', e);
                }
            }
        };
    }
}
