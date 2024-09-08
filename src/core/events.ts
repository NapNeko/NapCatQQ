import {
    BuddyReqType,
    ChatType,
    DataSource,
    FileElement,
    FriendRequest,
    GrayTipElement,
    GroupMemberRole,
    GroupNotify,
    GroupNotifyMsgStatus,
    GroupNotifyMsgType,
    NTGrayTipElementSubTypeV2,
    RawMessage,
    SendStatusType,
    TipGroupElementType,
} from '@/core/entities';
import { NodeIKernelBuddyListener, NodeIKernelGroupListener, NodeIKernelMsgListener } from '@/core/listeners';
import EventEmitter from 'node:events';
import TypedEmitter from 'typed-emitter/rxjs';
import { NapCatCore } from '@/core/index';
import { LRUCache } from '@/common/lru-cache';
import { proxiedListenerOf } from '@/common/proxy-handler';
import fastXmlParser from 'fast-xml-parser';

type NapCatInternalEvents = {
    'message/receive': (msg: RawMessage) => PromiseLike<void>;

    'message/send': (msg: RawMessage) => PromiseLike<void>;


    'buddy/request': (uid: string, words: string,
                      xRequest: FriendRequest) => PromiseLike<void>;

    'buddy/add': (uin: string,
                  xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'buddy/poke': (initiatorUin: string, targetUin: string,
                   xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

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


    'group/shut-up/put': (groupCode: string, targetUin: string, operatorUin: string, duration: number,
                          xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/shut-up/lift': (groupCode: string, targetUin: string, operatorUin: string,
                           xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/shut-up-all/put': (groupCode: string, operatorUin: string,
                              xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/shut-up-all/lift': (groupCode: string, operatorUin: string,
                               xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/card-change': (groupCode: string, changedUin: string, newCard: string, oldCard: string,
                          xMsg: RawMessage) => PromiseLike<void>;

    'group/member-increase/invite': (groupCode: string, newMemberUin: string, invitorUin: string,
                                     xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/member-increase/active': (groupCode: string, newMemberUin: string, approvalUin: string | undefined,
                                     xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/member-decrease/kick': (groupCode: string, leftMemberUin: string, operatorUin: string,
                                   xGroupNotify: GroupNotify) => PromiseLike<void>;

    'group/member-decrease/self-kicked': (groupCode: string, operatorUin: string,
                                          xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/member-decrease/leave': (groupCode: string, leftMemberUin: string,
                                    xGroupNotify: GroupNotify) => PromiseLike<void>;

    'group/member-decrease/unknown': (groupCode: string, leftMemberUin: string,
                                      // If it comes from onGroupNotifiesUpdated
                                      xGroupNotify?: GroupNotify,
                                      // If it comes from onRecvSysMsg
                                      xGrayTipElement?: GrayTipElement, xMsg?: RawMessage) => PromiseLike<void>;

    'group/essence': (groupCode: string, messageId: string, operation: 'add' | 'delete',
                      xGrayTipElement: GrayTipElement,
                      xGrayTipSourceMsg: RawMessage /* this is not the message that is set to be essence msg */) => PromiseLike<void>;

    'group/recall': (groupCode: string, operatorUin: string, messageId: string,
                     xGrayTipSourceMsg: RawMessage /* This is not the message that is recalled */) => PromiseLike<void>;

    'group/title': (groupCode: string, targetUin: string, newTitle: string,
                    xGrayTipElement: GrayTipElement, xMsg: RawMessage) => PromiseLike<void>;

    'group/upload': (groupCode: string, uploaderUin: string, fileElement: FileElement,
                     xMsg: RawMessage) => PromiseLike<void>;

    'group/emoji-like': (groupCode: string, operatorUin: string, messageId: string, likes: { emojiId: string, count: number }[],
                         // If it comes from onRecvMsg
                         xGrayTipElement?: GrayTipElement, xMsg?: RawMessage,
                         // If it comes from onRecvSysMsg
                         xSysMsg?: number[]) => PromiseLike<void>;

    'group/poke': (groupCode: string, initiatorUin: string, targetUin: string,
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
            Promise.allSettled(
                msgList.filter(msg => msg.senderUin !== this.core.selfInfo.uin)
                    .map(msg => {
                        this.parseRawMsgToEventAndEmit(msg)
                            .then(handled => {
                                if (!handled) this.emit('message/receive', msg);
                            });
                    }),
            ).then(callRes => {
                callRes.forEach(res => {
                    if (res.status === 'rejected') {
                        this.core.context.logger.logError('处理消息失败', res.reason);
                    }
                });
            });
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
                    continue;
                }

                // Handle message send
                if (msg.sendStatus === SendStatusType.KSEND_STATUS_SUCCESS && !msgIdSentCache.get(msg.msgId)) {
                    msgIdSentCache.put(msg.msgId, true);
                    const handled = await this.parseRawMsgToEventAndEmit(msg);
                    if (!handled) this.emit('message/send', msg);
                }
            }
        };

        msgListener.onInputStatusPush = async data => {
            this.emit('buddy/input-status', data);
        };

        this.core.context.session.getMsgService().addKernelMsgListener(
            proxiedListenerOf(msgListener, this.core.context.logger) as any,
        );
    }

    private async parseRawMsgToEventAndEmit(msg: RawMessage) {
        let handled = false;

        if (msg.chatType === ChatType.KCHATTYPEC2C) {
            for (const element of msg.elements) {
                if (element.grayTipElement) {
                    if (element.grayTipElement.subElementType == NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_JSON) {
                        try {
                            if (element.grayTipElement.jsonGrayTipElement.busiId == 1061) {
                                const json = JSON.parse(element.grayTipElement.jsonGrayTipElement.jsonStr);
                                const pokeDetail = (json.items as any[]).filter(item => item.uid);
                                if (pokeDetail.length == 2) {
                                    this.emit(
                                        'buddy/poke',
                                        await this.core.apis.UserApi.getUinByUidV2(pokeDetail[0].uid),
                                        await this.core.apis.UserApi.getUinByUidV2(pokeDetail[1].uid)!,
                                        element.grayTipElement, msg,
                                    );
                                    handled = true;
                                }
                            }
                        } catch (e) {
                            this.core.context.logger.logError('解析 Poke 消息失败', e);
                        }
                    }

                    if (element.grayTipElement.subElementType == NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_XMLMSG) {
                        try {
                            if (element.grayTipElement.xmlElement.templId === '10229' && msg.peerUin !== '') {
                                this.emit(
                                    'buddy/add',
                                    msg.peerUin,
                                    element.grayTipElement, msg,
                                );
                                handled = true;
                            }
                        } catch (e) {
                            this.core.context.logger.logError('解析好友增加消息失败', e);
                        }
                    }
                }
            }
        } else if (msg.chatType === ChatType.KCHATTYPEGROUP) {
            for (const element of msg.elements) {
                if (element.grayTipElement) {
                    if (element.grayTipElement.groupElement) {
                        /*
                         * Events that are included in groupElements:
                         * - group/member-increase/active
                         * - group/mute, ...
                         * - group/member-decrease/...
                         */

                        const groupElement = element.grayTipElement.groupElement;
                        const groupCode = msg.peerUin;

                        try {
                            if (groupElement.type === TipGroupElementType.memberIncrease) {
                                const member = await this.core.apis.GroupApi.getGroupMember(groupCode, groupElement.memberUid);
                                const adminMemberOrEmpty = groupElement.adminUid ?
                                    await this.core.apis.GroupApi.getGroupMember(groupCode, groupElement.adminUid) :
                                    undefined;
                                this.emit(
                                    'group/member-increase/active',
                                    groupCode,
                                    member!.uin,
                                    adminMemberOrEmpty?.uin,
                                    element.grayTipElement, msg,
                                );
                                handled = true;
                            }
                        } catch (e) {
                            this.core.context.logger.logError('解析群成员增加消息失败', e);
                        }

                        try {
                            if (groupElement.type === TipGroupElementType.ban) {
                                const shutUpAttr = groupElement.shutUp!;
                                const durationOrLiftBan = parseInt(shutUpAttr.duration);
                                if (shutUpAttr.member?.uid) {
                                    if (durationOrLiftBan > 0) {
                                        this.emit(
                                            'group/shut-up/put',
                                            groupCode,
                                            (await this.core.apis.GroupApi.getGroupMember(groupCode, shutUpAttr.member.uid))!.uin,
                                            (await this.core.apis.GroupApi.getGroupMember(groupCode, shutUpAttr.admin.uid))!.uin,
                                            durationOrLiftBan,
                                            element.grayTipElement, msg,
                                        );
                                    } else {
                                        this.emit(
                                            'group/shut-up/lift',
                                            groupCode,
                                            (await this.core.apis.GroupApi.getGroupMember(groupCode, shutUpAttr.member.uid))!.uin,
                                            (await this.core.apis.GroupApi.getGroupMember(groupCode, shutUpAttr.admin.uid))!.uin,
                                            element.grayTipElement, msg,
                                        );
                                    }
                                } else {
                                    if (durationOrLiftBan > 0) {
                                        this.emit(
                                            'group/shut-up-all/put',
                                            groupCode,
                                            (await this.core.apis.GroupApi.getGroupMember(groupCode, shutUpAttr.admin.uid))!.uin,
                                            element.grayTipElement, msg,
                                        );
                                    } else {
                                        this.emit(
                                            'group/shut-up-all/lift',
                                            groupCode,
                                            (await this.core.apis.GroupApi.getGroupMember(groupCode, shutUpAttr.admin.uid))!.uin,
                                            element.grayTipElement, msg,
                                        );
                                    }
                                }
                                handled = true;
                            }
                        } catch (e) {
                            this.core.context.logger.logError('解析群禁言消息失败', e);
                        }

                        try {
                            if (groupElement.type == TipGroupElementType.kicked) {
                                await this.core.apis.GroupApi.quitGroup(groupCode);
                                const adminUin =
                                    (await this.core.apis.GroupApi.getGroupMember(groupCode, groupElement.adminUid))?.uin ??
                                    (await this.core.apis.UserApi.getUinByUidV2(groupElement.adminUid));
                                if (adminUin) {
                                    this.emit(
                                        'group/member-decrease/self-kicked',
                                        groupCode,
                                        adminUin,
                                        element.grayTipElement, msg,
                                    );
                                } else {
                                    this.emit(
                                        'group/member-decrease/unknown',
                                        groupCode,
                                        this.core.selfInfo.uin,
                                        undefined,
                                        element.grayTipElement, msg,
                                    );
                                }
                                handled = true;
                            }
                        } catch (e) {
                            this.core.context.logger.logError('解析退群消息失败', e);
                        }
                    }

                    if (element.grayTipElement.xmlElement) {
                        /*
                         * Events that are included in xmlElement:
                         * - group/emoji-like
                         * - group/member-increase/invite
                         */
                        if (element.grayTipElement.xmlElement.templId === '10382') {
                            const emojiLikeData = new fastXmlParser.XMLParser({
                                ignoreAttributes: false,
                                attributeNamePrefix: '',
                            }).parse(element.grayTipElement.xmlElement.content);
                            const groupCode = msg.peerUin;
                            const senderUin = emojiLikeData.gtip.qq.jp;
                            const msgSeq = emojiLikeData.gtip.url.msgseq;
                            const emojiId = emojiLikeData.gtip.face.id;
                            const likedMsgId = await this.findMsgIdForEmojiLikeEventByMsgSeq(groupCode, msgSeq);
                            if (!likedMsgId) {
                                this.core.context.logger.logError('解析表情回应消息失败: 未找到回应消息');
                            } else {
                                this.emit(
                                    'group/emoji-like',
                                    groupCode,
                                    senderUin,
                                    likedMsgId,
                                    [{ emojiId, count: 1 }],
                                    element.grayTipElement, msg,
                                );
                                handled = true;
                            }
                        }

                        // Todo: What is the temp id for group member increase?
                        try {
                            const groupCode = msg.peerUin;
                            const memberUin = element.grayTipElement.xmlElement.content.match(/uin="(\d+)"/)![1];
                            const invitorUin = element.grayTipElement.xmlElement.content.match(/uin="(\d+)"/)![1];
                            this.emit(
                                'group/member-increase/invite',
                                groupCode,
                                memberUin,
                                invitorUin,
                                element.grayTipElement, msg,
                            );
                            handled = true;
                        } catch (e) {
                            this.core.context.logger.logError('解析群邀请消息失败', e);
                        }
                    }

                    if (element.grayTipElement.subElementType === NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_JSON) {
                        /*
                         * Events that are included in jsonGrayTipElement:
                         * - group/poke
                         * - group/essence
                         * - group/title
                         */

                        const json = JSON.parse(element.grayTipElement.jsonGrayTipElement.jsonStr);

                        try {
                            if (element.grayTipElement.jsonGrayTipElement.busiId === 1061) {
                                const pokeDetail = (json.items as any[]).filter(item => item.uid);
                                if (pokeDetail.length == 2) {
                                    this.emit(
                                        'group/poke',
                                        msg.peerUin,
                                        await this.core.apis.UserApi.getUinByUidV2(pokeDetail[0].uid),
                                        await this.core.apis.UserApi.getUinByUidV2(pokeDetail[1].uid)!,
                                        element.grayTipElement, msg,
                                    );
                                }
                                handled = true;
                            }
                        } catch (e) {
                            this.core.context.logger.logError('解析群拍一拍消息失败', e);
                        }

                        try {
                            if (element.grayTipElement.jsonGrayTipElement.busiId === 2401) {
                                const searchParams = new URL(json.items[0].jp).searchParams;
                                const msgSeq = searchParams.get('msgSeq')!;
                                const Group = searchParams.get('groupCode');
                                const msgData = await this.core.apis.MsgApi.getMsgsBySeqAndCount({
                                    guildId: '',
                                    chatType: ChatType.KCHATTYPEGROUP,
                                    peerUid: Group!,
                                }, msgSeq.toString(), 1, true, true);
                                this.emit(
                                    'group/essence',
                                    msg.peerUid,
                                    msgData.msgList[0].msgId,
                                    'add',
                                    element.grayTipElement, msg,
                                );
                                handled = true;
                            }
                        } catch (e) {
                            this.core.context.logger.logError('解析群精华消息失败', e);
                        }

                        try {
                            if (element.grayTipElement.jsonGrayTipElement.busiId === 2407) {
                                const memberUin = json.items[1].param[0];
                                const title = json.items[3].txt;
                                this.emit(
                                    'group/title',
                                    msg.peerUin,
                                    memberUin,
                                    title,
                                    element.grayTipElement, msg,
                                );
                                handled = true;
                            }
                        } catch (e) {
                            this.core.context.logger.logError('解析群头衔消息失败', e);
                        }
                    }
                }

                if (element.fileElement) {
                    this.emit(
                        'group/upload',
                        msg.peerUin,
                        msg.senderUin,
                        element.fileElement,
                        msg,
                    );
                }
            }
        }

        return handled;
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
                                'group/member-decrease/kick',
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

        groupListener.onMemberInfoChange = async (groupCode, dataSource, members) => {
            if (dataSource === DataSource.LOCAL) {
                const existMembers = this.core.apis.GroupApi.groupMemberCache.get(groupCode);
                if (!existMembers) return;
                members.forEach(member => {
                    const existMember = existMembers.get(member.uid);
                    if (!existMember?.isChangeRole) return;
                    this.core.context.logger.logDebug('变动管理员', member);
                    this.emit(
                        'group/admin',
                        groupCode,
                        member.uin,
                        member.role === GroupMemberRole.admin ? 'set' : 'unset',
                    );
                });
            }
        };

        this.core.context.session.getGroupService().addKernelGroupListener(
            proxiedListenerOf(groupListener, this.core.context.logger),
        );
    }

    private async findMsgIdForEmojiLikeEventByMsgSeq(groupCode: string, msgSeq: string) {
        const peer = {
            chatType: ChatType.KCHATTYPEGROUP,
            guildId: '',
            peerUid: groupCode,
        };
        const replyMsgList = (await this.core.apis.MsgApi.getMsgExBySeq(peer, msgSeq)).msgList;
        if (replyMsgList.length < 1) {
            return null;
        }
        const replyMsg = replyMsgList
            .filter(e => e.msgSeq == msgSeq)
            .sort((a, b) => parseInt(a.msgTime) - parseInt(b.msgTime))[0];

        if (!replyMsg) {
            this.core.context.logger.logError('解析表情回应消息失败: 未找到回应消息');
            return null;
        }
        return replyMsg.msgId;
    }
}
